import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      sendSuccess(res, notifications);
    } catch (error: any) {
      console.error('Get notifications error:', error);
      sendError(res, 'Failed to fetch notifications.', 'NOTIFICATION_ERROR', 500);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const updated = await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });

      sendSuccess(res, updated, 'Notification marked as read');
    } catch (error: any) {
      console.error('Mark read error:', error);
      sendError(res, 'Failed to update notification.', 'NOTIFICATION_ERROR', 500);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });

      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error: any) {
      console.error('Mark all read error:', error);
      sendError(res, 'Failed to update notifications.', 'NOTIFICATION_ERROR', 500);
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await prisma.notification.deleteMany({
        where: { id, userId },
      });

      sendSuccess(res, null, 'Notification removed');
    } catch (error: any) {
      console.error('Delete notification error:', error);
      sendError(res, 'Failed to delete notification.', 'NOTIFICATION_ERROR', 500);
    }
  }

  static async clearAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      await prisma.notification.deleteMany({
        where: { userId },
      });

      sendSuccess(res, null, 'All notifications cleared');
    } catch (error: any) {
      console.error('Clear notifications error:', error);
      sendError(res, 'Failed to clear notifications.', 'NOTIFICATION_ERROR', 500);
    }
  }
}
