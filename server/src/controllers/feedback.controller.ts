import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AIService } from '../services/ai.service.js';
import { FeedbackSentiment } from '@prisma/client';

export class FeedbackController {
  static async submit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;
      const { rating, comment, registrationCode } = req.body;
      const userId = req.user!.userId;

      if (!rating || !comment) {
        sendError(res, 'Rating (1-5) and comment are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      // Find user's registration for this event
      let registration = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (!registration && registrationCode) {
        registration = await prisma.registration.findFirst({
          where: { registrationCode, eventId },
        });
      }

      if (!registration) {
        sendError(res, 'You must be a registered participant of this event to leave feedback.', 'NOT_REGISTERED', 403);
        return;
      }

      // Check if feedback was already submitted
      const existing = await prisma.feedback.findUnique({
        where: { registrationId: registration.id },
      });

      if (existing) {
        sendError(res, 'You have already submitted feedback for this event registration.', 'DUPLICATE_FEEDBACK', 409);
        return;
      }

      // Perform Sentiment Analysis
      const sentimentResult = AIService.analyzeSentiment(comment);

      const feedback = await prisma.feedback.create({
        data: {
          eventId,
          registrationId: registration.id,
          userId,
          rating: Number(rating),
          comment,
          sentiment: sentimentResult.sentiment as FeedbackSentiment,
          sentimentScore: sentimentResult.score,
        },
        include: {
          user: { select: { id: true, name: true, department: true } },
        },
      });

      sendSuccess(res, feedback, 'Feedback submitted with sentiment analysis completed!', 201);
    } catch (error: any) {
      console.error('Feedback submit error:', error);
      sendError(res, 'Failed to submit feedback.', 'FEEDBACK_SUBMIT_ERROR', 500);
    }
  }

  static async getEventFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;

      const feedbacks = await prisma.feedback.findMany({
        where: { eventId },
        include: {
          user: { select: { id: true, name: true, department: true } },
          registration: { select: { registrationCode: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = feedbacks.length;
      const avgRating = total > 0 ? Number((feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(2)) : 0;

      const positiveCount = feedbacks.filter((f) => f.sentiment === FeedbackSentiment.POSITIVE).length;
      const neutralCount = feedbacks.filter((f) => f.sentiment === FeedbackSentiment.NEUTRAL).length;
      const negativeCount = feedbacks.filter((f) => f.sentiment === FeedbackSentiment.NEGATIVE).length;

      const sentimentSummary = {
        positivePercentage: total > 0 ? Number(((positiveCount / total) * 100).toFixed(1)) : 0,
        neutralPercentage: total > 0 ? Number(((neutralCount / total) * 100).toFixed(1)) : 0,
        negativePercentage: total > 0 ? Number(((negativeCount / total) * 100).toFixed(1)) : 0,
        positiveCount,
        neutralCount,
        negativeCount,
      };

      // Rating distribution
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbacks.forEach((f) => {
        if (f.rating >= 1 && f.rating <= 5) {
          ratingCounts[f.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      sendSuccess(res, {
        totalFeedback: total,
        averageRating: avgRating,
        sentimentSummary,
        ratingDistribution: ratingCounts,
        feedbacks,
      });
    } catch (error: any) {
      console.error('Get event feedback error:', error);
      sendError(res, 'Failed to fetch event feedback.', 'FEEDBACK_FETCH_ERROR', 500);
    }
  }
}
