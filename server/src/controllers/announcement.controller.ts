import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AnnouncementType } from '@prisma/client';

export class AnnouncementController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, priority } = req.query;

      const where: any = {};
      if (eventId) {
        where.OR = [{ eventId: String(eventId) }, { eventId: null }];
      }
      if (priority) {
        where.priority = priority as AnnouncementType;
      }

      const announcements = await prisma.announcement.findMany({
        where,
        include: {
          event: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, announcements);
    } catch (error: any) {
      console.error('Get announcements error:', error);
      sendError(res, 'Failed to fetch announcements.', 'ANNOUNCEMENTS_FETCH_ERROR', 500);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, message, eventId, priority } = req.body;
      const createdById = req.user!.userId;

      if (!title || !message) {
        sendError(res, 'Title and message are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          message,
          eventId: eventId || null,
          priority: (priority as AnnouncementType) || AnnouncementType.NORMAL,
          createdById,
        },
        include: {
          event: true,
          createdBy: { select: { name: true } },
        },
      });

      // If Emergency or Important, broadcast in-app notification to all users
      if (priority === AnnouncementType.EMERGENCY || priority === AnnouncementType.IMPORTANT) {
        const users = await prisma.user.findMany({ select: { id: true } });
        const notificationsData = users.map((u) => ({
          userId: u.id,
          title: priority === AnnouncementType.EMERGENCY ? `🚨 ${title}` : `📢 ${title}`,
          message: message.substring(0, 140),
          type: priority === AnnouncementType.EMERGENCY ? 'EMERGENCY' : 'ANNOUNCEMENT',
          link: '/announcements',
        }));

        await prisma.notification.createMany({
          data: notificationsData,
        });
      }

      sendSuccess(res, announcement, 'Announcement published successfully', 201);
    } catch (error: any) {
      console.error('Create announcement error:', error);
      sendError(res, 'Failed to create announcement.', 'ANNOUNCEMENT_CREATE_ERROR', 500);
    }
  }
}
