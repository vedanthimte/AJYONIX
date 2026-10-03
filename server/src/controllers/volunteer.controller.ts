import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class VolunteerController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const volunteers = await prisma.volunteer.findMany({
        include: {
          assignments: {
            include: { event: { select: { id: true, name: true, date: true } } },
          },
        },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, volunteers);
    } catch (error: any) {
      console.error('Get volunteers error:', error);
      sendError(res, 'Failed to fetch volunteers.', 'VOLUNTEER_FETCH_ERROR', 500);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, skills, availability, department } = req.body;

      if (!name || !email) {
        sendError(res, 'Name and email are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const volunteer = await prisma.volunteer.create({
        data: {
          name,
          email,
          phone: phone || '',
          skills: skills || 'General Assistance',
          availability: availability || 'Available',
          department: department || 'General',
        },
      });

      sendSuccess(res, volunteer, 'Volunteer added successfully', 201);
    } catch (error: any) {
      console.error('Create volunteer error:', error);
      sendError(res, 'Failed to create volunteer profile.', 'VOLUNTEER_CREATE_ERROR', 500);
    }
  }

  static async assignDuty(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId, volunteerId, duty, shift } = req.body;

      if (!eventId || !volunteerId || !duty || !shift) {
        sendError(res, 'Event, volunteer, duty, and shift are required.', 'VALIDATION_ERROR', 400);
        return;
      }

      const assignment = await prisma.volunteerAssignment.create({
        data: {
          eventId,
          volunteerId,
          duty,
          shift,
          status: 'ASSIGNED',
        },
        include: {
          event: true,
          volunteer: true,
        },
      });

      // Notify volunteer if user account exists
      if (assignment.volunteer.userId) {
        await prisma.notification.create({
          data: {
            userId: assignment.volunteer.userId,
            title: 'New Duty Assignment',
            message: `You are assigned to "${duty}" (${shift}) for event "${assignment.event.name}".`,
            type: 'DUTY',
            link: '/volunteer/duties',
          },
        });
      }

      sendSuccess(res, assignment, 'Duty assigned successfully', 201);
    } catch (error: any) {
      console.error('Assign duty error:', error);
      sendError(res, 'Failed to assign duty.', 'ASSIGNMENT_ERROR', 500);
    }
  }

  static async getMyDuties(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const volunteer = await prisma.volunteer.findUnique({
        where: { userId },
      });

      if (!volunteer) {
        // Volunteer record might not be linked, or user has email matching volunteer
        const volunteerByEmail = await prisma.volunteer.findFirst({
          where: { email: req.user!.email },
        });

        if (!volunteerByEmail) {
          sendSuccess(res, []);
          return;
        }

        const assignments = await prisma.volunteerAssignment.findMany({
          where: { volunteerId: volunteerByEmail.id },
          include: {
            event: {
              include: { venue: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        sendSuccess(res, assignments);
        return;
      }

      const assignments = await prisma.volunteerAssignment.findMany({
        where: { volunteerId: volunteer.id },
        include: {
          event: {
            include: { venue: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, assignments);
    } catch (error: any) {
      console.error('Get my duties error:', error);
      sendError(res, 'Failed to fetch duty assignments.', 'DUTIES_FETCH_ERROR', 500);
    }
  }

  static async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.volunteerAssignment.delete({
        where: { id },
      });

      sendSuccess(res, null, 'Duty assignment removed');
    } catch (error: any) {
      console.error('Delete assignment error:', error);
      sendError(res, 'Failed to delete assignment.', 'DELETE_ERROR', 500);
    }
  }
}
