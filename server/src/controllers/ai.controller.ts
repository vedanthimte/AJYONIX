import { Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AIController {
  static async plan(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, expectedParticipants, durationHours, budget, venueRequirements } = req.body;

      if (!eventType || !expectedParticipants || !budget) {
        sendError(res, 'eventType, expectedParticipants, and budget are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const plan = await AIService.planEvent({
        eventType,
        expectedParticipants: Number(expectedParticipants),
        durationHours: Number(durationHours) || 6,
        budget: Number(budget),
        venueRequirements,
      });

      sendSuccess(res, plan, 'AI Event Plan generated successfully');
    } catch (error: any) {
      console.error('AI plan error:', error);
      sendError(res, 'Failed to generate AI event plan.', 'AI_PLAN_ERROR', 500);
    }
  }

  static async assistant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      const user = req.user || { role: 'PARTICIPANT', name: 'Student Guest' };

      if (!query) {
        sendError(res, 'Query string is required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const response = await AIService.answerAssistant(query, user);
      sendSuccess(res, response);
    } catch (error: any) {
      console.error('AI assistant error:', error);
      sendError(res, 'Failed to process AI assistant inquiry.', 'AI_ASSISTANT_ERROR', 500);
    }
  }

  static async sentiment(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;

      if (!text) {
        sendError(res, 'Text string is required for sentiment analysis.', 'VALIDATION_ERROR', 400);
        return;
      }

      const result = AIService.analyzeSentiment(text);
      sendSuccess(res, result);
    } catch (error: any) {
      console.error('Sentiment analysis error:', error);
      sendError(res, 'Failed to analyze sentiment.', 'SENTIMENT_ERROR', 500);
    }
  }

  static async foodPrediction(req: Request, res: Response): Promise<void> {
    try {
      const { registeredParticipants, historicalAttendancePercentage, eventType, numberOfMeals } = req.body;

      if (!registeredParticipants) {
        sendError(res, 'registeredParticipants is required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const prediction = AIService.predictFoodWaste({
        registeredParticipants: Number(registeredParticipants),
        historicalAttendancePercentage: historicalAttendancePercentage ? Number(historicalAttendancePercentage) : 82,
        eventType,
        numberOfMeals: numberOfMeals ? Number(numberOfMeals) : 1,
      });

      sendSuccess(res, prediction, 'Food waste prediction generated');
    } catch (error: any) {
      console.error('Food prediction error:', error);
      sendError(res, 'Failed to calculate food prediction.', 'FOOD_PRED_ERROR', 500);
    }
  }

  static async recommendations(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, participants, budget } = req.body;

      if (!eventType || !participants || !budget) {
        sendError(res, 'eventType, participants, and budget are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const recommendations = await AIService.getRecommendations({
        eventType,
        participants: Number(participants),
        budget: Number(budget),
      });

      sendSuccess(res, recommendations);
    } catch (error: any) {
      console.error('Recommendations error:', error);
      sendError(res, 'Failed to fetch recommendations.', 'RECOMMENDATIONS_ERROR', 500);
    }
  }
}
