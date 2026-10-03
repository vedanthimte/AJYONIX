"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_js_1 = require("../services/ai.service.js");
const response_js_1 = require("../utils/response.js");
class AIController {
    static async plan(req, res) {
        try {
            const { eventType, expectedParticipants, durationHours, budget, venueRequirements } = req.body;
            if (!eventType || !expectedParticipants || !budget) {
                (0, response_js_1.sendError)(res, 'eventType, expectedParticipants, and budget are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const plan = await ai_service_js_1.AIService.planEvent({
                eventType,
                expectedParticipants: Number(expectedParticipants),
                durationHours: Number(durationHours) || 6,
                budget: Number(budget),
                venueRequirements,
            });
            (0, response_js_1.sendSuccess)(res, plan, 'AI Event Plan generated successfully');
        }
        catch (error) {
            console.error('AI plan error:', error);
            (0, response_js_1.sendError)(res, 'Failed to generate AI event plan.', 'AI_PLAN_ERROR', 500);
        }
    }
    static async assistant(req, res) {
        try {
            const { query } = req.body;
            const user = req.user || { role: 'PARTICIPANT', name: 'Student Guest' };
            if (!query) {
                (0, response_js_1.sendError)(res, 'Query string is required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const response = await ai_service_js_1.AIService.answerAssistant(query, user);
            (0, response_js_1.sendSuccess)(res, response);
        }
        catch (error) {
            console.error('AI assistant error:', error);
            (0, response_js_1.sendError)(res, 'Failed to process AI assistant inquiry.', 'AI_ASSISTANT_ERROR', 500);
        }
    }
    static async sentiment(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                (0, response_js_1.sendError)(res, 'Text string is required for sentiment analysis.', 'VALIDATION_ERROR', 400);
                return;
            }
            const result = ai_service_js_1.AIService.analyzeSentiment(text);
            (0, response_js_1.sendSuccess)(res, result);
        }
        catch (error) {
            console.error('Sentiment analysis error:', error);
            (0, response_js_1.sendError)(res, 'Failed to analyze sentiment.', 'SENTIMENT_ERROR', 500);
        }
    }
    static async foodPrediction(req, res) {
        try {
            const { registeredParticipants, historicalAttendancePercentage, eventType, numberOfMeals } = req.body;
            if (!registeredParticipants) {
                (0, response_js_1.sendError)(res, 'registeredParticipants is required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const prediction = ai_service_js_1.AIService.predictFoodWaste({
                registeredParticipants: Number(registeredParticipants),
                historicalAttendancePercentage: historicalAttendancePercentage ? Number(historicalAttendancePercentage) : 82,
                eventType,
                numberOfMeals: numberOfMeals ? Number(numberOfMeals) : 1,
            });
            (0, response_js_1.sendSuccess)(res, prediction, 'Food waste prediction generated');
        }
        catch (error) {
            console.error('Food prediction error:', error);
            (0, response_js_1.sendError)(res, 'Failed to calculate food prediction.', 'FOOD_PRED_ERROR', 500);
        }
    }
    static async recommendations(req, res) {
        try {
            const { eventType, participants, budget } = req.body;
            if (!eventType || !participants || !budget) {
                (0, response_js_1.sendError)(res, 'eventType, participants, and budget are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const recommendations = await ai_service_js_1.AIService.getRecommendations({
                eventType,
                participants: Number(participants),
                budget: Number(budget),
            });
            (0, response_js_1.sendSuccess)(res, recommendations);
        }
        catch (error) {
            console.error('Recommendations error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch recommendations.', 'RECOMMENDATIONS_ERROR', 500);
        }
    }
}
exports.AIController = AIController;
