import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, NotificationController.getMyNotifications);
router.patch('/read-all', authenticate, NotificationController.markAllAsRead);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.delete('/clear-all', authenticate, NotificationController.clearAll);
router.delete('/:id', authenticate, NotificationController.deleteNotification);

export default router;
