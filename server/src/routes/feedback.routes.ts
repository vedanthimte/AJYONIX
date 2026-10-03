import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/event/:id', authenticate, FeedbackController.submit);
router.get('/event/:id', authenticate, FeedbackController.getEventFeedback);

export default router;
