"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const client_1 = require("@prisma/client");
class AnnouncementController {
    static async getAll(req, res) {
        try {
            const { eventId, priority } = req.query;
            const where = {};
            if (eventId) {
                where.OR = [{ eventId: String(eventId) }, { eventId: null }];
            }
            if (priority) {
                where.priority = priority;
            }
            const announcements = await prisma_js_1.prisma.announcement.findMany({
                where,
                include: {
                    event: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true, role: true } },
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            });
            (0, response_js_1.sendSuccess)(res, announcements);
        }
        catch (error) {
            console.error('Get announcements error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch announcements.', 'ANNOUNCEMENTS_FETCH_ERROR', 500);
        }
    }
    static async create(req, res) {
        try {
            const { title, message, eventId, priority } = req.body;
            const createdById = req.user.userId;
            if (!title || !message) {
                (0, response_js_1.sendError)(res, 'Title and message are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const announcement = await prisma_js_1.prisma.announcement.create({
                data: {
                    title,
                    message,
                    eventId: eventId || null,
                    priority: priority || client_1.AnnouncementType.NORMAL,
                    createdById,
                },
                include: {
                    event: true,
                    createdBy: { select: { name: true } },
                },
            });
            // If Emergency or Important, broadcast in-app notification to all users
            if (priority === client_1.AnnouncementType.EMERGENCY || priority === client_1.AnnouncementType.IMPORTANT) {
                const users = await prisma_js_1.prisma.user.findMany({ select: { id: true } });
                const notificationsData = users.map((u) => ({
                    userId: u.id,
                    title: priority === client_1.AnnouncementType.EMERGENCY ? `🚨 ${title}` : `📢 ${title}`,
                    message: message.substring(0, 140),
                    type: priority === client_1.AnnouncementType.EMERGENCY ? 'EMERGENCY' : 'ANNOUNCEMENT',
                    link: '/announcements',
                }));
                await prisma_js_1.prisma.notification.createMany({
                    data: notificationsData,
                });
            }
            (0, response_js_1.sendSuccess)(res, announcement, 'Announcement published successfully', 201);
        }
        catch (error) {
            console.error('Create announcement error:', error);
            (0, response_js_1.sendError)(res, 'Failed to create announcement.', 'ANNOUNCEMENT_CREATE_ERROR', 500);
        }
    }
}
exports.AnnouncementController = AnnouncementController;
