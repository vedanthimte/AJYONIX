"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class NotificationController {
    static async getMyNotifications(req, res) {
        try {
            const userId = req.user.userId;
            const notifications = await prisma_js_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 30,
            });
            (0, response_js_1.sendSuccess)(res, notifications);
        }
        catch (error) {
            console.error('Get notifications error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch notifications.', 'NOTIFICATION_ERROR', 500);
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const updated = await prisma_js_1.prisma.notification.updateMany({
                where: { id, userId },
                data: { read: true },
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Notification marked as read');
        }
        catch (error) {
            console.error('Mark read error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update notification.', 'NOTIFICATION_ERROR', 500);
        }
    }
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.userId;
            await prisma_js_1.prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true },
            });
            (0, response_js_1.sendSuccess)(res, null, 'All notifications marked as read');
        }
        catch (error) {
            console.error('Mark all read error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update notifications.', 'NOTIFICATION_ERROR', 500);
        }
    }
}
exports.NotificationController = NotificationController;
