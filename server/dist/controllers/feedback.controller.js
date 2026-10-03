"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const ai_service_js_1 = require("../services/ai.service.js");
const client_1 = require("@prisma/client");
class FeedbackController {
    static async submit(req, res) {
        try {
            const { id: eventId } = req.params;
            const { rating, comment, registrationCode } = req.body;
            const userId = req.user.userId;
            if (!rating || !comment) {
                (0, response_js_1.sendError)(res, 'Rating (1-5) and comment are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            // Find user's registration for this event
            let registration = await prisma_js_1.prisma.registration.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });
            if (!registration && registrationCode) {
                registration = await prisma_js_1.prisma.registration.findFirst({
                    where: { registrationCode, eventId },
                });
            }
            if (!registration) {
                (0, response_js_1.sendError)(res, 'You must be a registered participant of this event to leave feedback.', 'NOT_REGISTERED', 403);
                return;
            }
            // Check if feedback was already submitted
            const existing = await prisma_js_1.prisma.feedback.findUnique({
                where: { registrationId: registration.id },
            });
            if (existing) {
                (0, response_js_1.sendError)(res, 'You have already submitted feedback for this event registration.', 'DUPLICATE_FEEDBACK', 409);
                return;
            }
            // Perform Sentiment Analysis
            const sentimentResult = ai_service_js_1.AIService.analyzeSentiment(comment);
            const feedback = await prisma_js_1.prisma.feedback.create({
                data: {
                    eventId,
                    registrationId: registration.id,
                    userId,
                    rating: Number(rating),
                    comment,
                    sentiment: sentimentResult.sentiment,
                    sentimentScore: sentimentResult.score,
                },
                include: {
                    user: { select: { id: true, name: true, department: true } },
                },
            });
            (0, response_js_1.sendSuccess)(res, feedback, 'Feedback submitted with sentiment analysis completed!', 201);
        }
        catch (error) {
            console.error('Feedback submit error:', error);
            (0, response_js_1.sendError)(res, 'Failed to submit feedback.', 'FEEDBACK_SUBMIT_ERROR', 500);
        }
    }
    static async getEventFeedback(req, res) {
        try {
            const { id: eventId } = req.params;
            const feedbacks = await prisma_js_1.prisma.feedback.findMany({
                where: { eventId },
                include: {
                    user: { select: { id: true, name: true, department: true } },
                    registration: { select: { registrationCode: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            const total = feedbacks.length;
            const avgRating = total > 0 ? Number((feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(2)) : 0;
            const positiveCount = feedbacks.filter((f) => f.sentiment === client_1.FeedbackSentiment.POSITIVE).length;
            const neutralCount = feedbacks.filter((f) => f.sentiment === client_1.FeedbackSentiment.NEUTRAL).length;
            const negativeCount = feedbacks.filter((f) => f.sentiment === client_1.FeedbackSentiment.NEGATIVE).length;
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
                    ratingCounts[f.rating]++;
                }
            });
            (0, response_js_1.sendSuccess)(res, {
                totalFeedback: total,
                averageRating: avgRating,
                sentimentSummary,
                ratingDistribution: ratingCounts,
                feedbacks,
            });
        }
        catch (error) {
            console.error('Get event feedback error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch event feedback.', 'FEEDBACK_FETCH_ERROR', 500);
        }
    }
}
exports.FeedbackController = FeedbackController;
