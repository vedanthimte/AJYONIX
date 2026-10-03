import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { QRService } from '../services/qr.service.js';
import { RegistrationStatus, TransactionType } from '@prisma/client';

export class RegistrationController {
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;
      const userId = req.user!.userId;

      // 1. Fetch Event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });

      if (!event) {
        sendError(res, 'Event not found.', 'NOT_FOUND', 404);
        return;
      }

      // Check event status
      if (['CANCELLED', 'COMPLETED'].includes(event.status)) {
        sendError(res, `Cannot register for an event that is ${event.status}.`, 'EVENT_INACTIVE', 400);
        return;
      }

      // 2. Check registration deadline
      if (event.registrationClose && new Date() > new Date(event.registrationClose)) {
        sendError(res, 'Registration for this event has closed.', 'DEADLINE_PASSED', 400);
        return;
      }

      // 3. Check capacity limit
      if (event._count.registrations >= event.capacity) {
        sendError(res, 'This event is fully booked. Capacity reached.', 'CAPACITY_FULL', 400);
        return;
      }

      // 4. Prevent duplicate registration
      const existing = await prisma.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (existing) {
        sendError(res, 'You have already registered for this event.', 'ALREADY_REGISTERED', 409);
        return;
      }

      // Fetch user profile
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        sendError(res, 'User profile not found.', 'USER_NOT_FOUND', 404);
        return;
      }

      // Generate unique registration code: AYX-YYYY-XXXXX
      const registrationCode = QRService.generateRegistrationCode();

      // Create QR Payload
      const qrPayload = JSON.stringify({
        code: registrationCode,
        eventId: event.id,
        eventName: event.name,
        participantName: user.name,
        participantEmail: user.email,
        timestamp: new Date().toISOString(),
      });

      const registration = await prisma.registration.create({
        data: {
          registrationCode,
          eventId: event.id,
          userId: user.id,
          participantName: user.name,
          participantEmail: user.email,
          status: RegistrationStatus.CONFIRMED,
          qrCodeData: qrPayload,
        },
        include: {
          event: true,
        },
      });

      // If there is a fee, record transaction in Finance module
      if (event.registrationFee > 0) {
        await prisma.financeTransaction.create({
          data: {
            eventId: event.id,
            description: `Ticket Registration (${registrationCode}) - ${user.name}`,
            category: 'TicketSales',
            amount: event.registrationFee,
            type: TransactionType.INCOME,
            status: 'COMPLETED',
          },
        });
      }

      // Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Registration Confirmed!',
          message: `Your registration for "${event.name}" is confirmed with Pass Code: ${registrationCode}.`,
          type: 'REGISTRATION',
          link: '/my-qr',
        },
      });

      sendSuccess(res, registration, 'Registered successfully for the event!', 201);
    } catch (error: any) {
      console.error('Event registration error:', error);
      sendError(res, 'Failed to register for the event.', 'REGISTRATION_ERROR', 500);
    }
  }

  static async getEventRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id: eventId } = req.params;

      const registrations = await prisma.registration.findMany({
        where: { eventId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, department: true } },
          attendance: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, registrations);
    } catch (error: any) {
      console.error('Get event registrations error:', error);
      sendError(res, 'Failed to fetch registrations.', 'REGISTRATIONS_FETCH_ERROR', 500);
    }
  }

  static async getMyRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const registrations = await prisma.registration.findMany({
        where: { userId },
        include: {
          event: {
            include: { venue: true },
          },
          attendance: true,
          feedback: true,
          certificate: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, registrations);
    } catch (error: any) {
      console.error('Get my registrations error:', error);
      sendError(res, 'Failed to fetch personal registrations.', 'MY_REGISTRATIONS_ERROR', 500);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const registration = await prisma.registration.findFirst({
        where: {
          OR: [{ id }, { registrationCode: id }],
        },
        include: {
          event: { include: { venue: true } },
          user: true,
          attendance: true,
          certificate: true,
        },
      });

      if (!registration) {
        sendError(res, 'Registration record not found.', 'NOT_FOUND', 404);
        return;
      }

      sendSuccess(res, registration);
    } catch (error: any) {
      console.error('Get registration error:', error);
      sendError(res, 'Failed to fetch registration.', 'REGISTRATION_FETCH_ERROR', 500);
    }
  }
}
