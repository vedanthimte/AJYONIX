import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/planner', AIController.plan);
router.post('/assistant', authenticate, AIController.assistant);
router.post('/sentiment', AIController.sentiment);
router.post('/food-prediction', AIController.foodPrediction);
router.post('/recommendations', AIController.recommendations);

export default router;
