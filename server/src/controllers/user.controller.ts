import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { Role } from '@prisma/client';

export class UserController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
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

      sendSuccess(res, users);
    } catch (error: any) {
      console.error('Get users error:', error);
      sendError(res, 'Failed to fetch users list.', 'USERS_FETCH_ERROR', 500);
    }
  }

  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(Role).includes(role)) {
        sendError(res, 'Invalid role specified.', 'INVALID_ROLE', 400);
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });

      sendSuccess(res, updated, `Role updated to ${role}`);
    } catch (error: any) {
      console.error('Update role error:', error);
      sendError(res, 'Failed to update user role.', 'ROLE_UPDATE_ERROR', 500);
    }
  }
}
