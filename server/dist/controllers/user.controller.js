"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const client_1 = require("@prisma/client");
class UserController {
    static async getAll(req, res) {
        try {
            const users = await prisma_js_1.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    department: true,
                    createdAt: true,
                    _count: {
                        select: {
                            registrations: true,
                            attendanceRecords: true,
                            eventsOrganized: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, users);
        }
        catch (error) {
            console.error('Get users error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch users list.', 'USERS_FETCH_ERROR', 500);
        }
    }
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!Object.values(client_1.Role).includes(role)) {
                (0, response_js_1.sendError)(res, 'Invalid role specified.', 'INVALID_ROLE', 400);
                return;
            }
            const updated = await prisma_js_1.prisma.user.update({
                where: { id },
                data: { role },
                select: { id: true, name: true, email: true, role: true },
            });
            (0, response_js_1.sendSuccess)(res, updated, `Role updated to ${role}`);
        }
        catch (error) {
            console.error('Update role error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update user role.', 'ROLE_UPDATE_ERROR', 500);
        }
    }
}
exports.UserController = UserController;
