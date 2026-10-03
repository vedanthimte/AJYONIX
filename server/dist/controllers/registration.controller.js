"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const qr_service_js_1 = require("../services/qr.service.js");
const client_1 = require("@prisma/client");
class RegistrationController {
    static async register(req, res) {
        try {
            const { id: eventId } = req.params;
            const userId = req.user.userId;
            // 1. Fetch Event
            const event = await prisma_js_1.prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    _count: {
                        select: { registrations: true },
                    },
                },
            });
            if (!event) {
                (0, response_js_1.sendError)(res, 'Event not found.', 'NOT_FOUND', 404);
                return;
            }
            // Check event status
            if (['CANCELLED', 'COMPLETED'].includes(event.status)) {
                (0, response_js_1.sendError)(res, `Cannot register for an event that is ${event.status}.`, 'EVENT_INACTIVE', 400);
                return;
            }
            // 2. Check registration deadline
            if (event.registrationClose && new Date() > new Date(event.registrationClose)) {
                (0, response_js_1.sendError)(res, 'Registration for this event has closed.', 'DEADLINE_PASSED', 400);
                return;
            }
            // 3. Check capacity limit
            if (event._count.registrations >= event.capacity) {
                (0, response_js_1.sendError)(res, 'This event is fully booked. Capacity reached.', 'CAPACITY_FULL', 400);
                return;
            }
            // 4. Prevent duplicate registration
            const existing = await prisma_js_1.prisma.registration.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
            });
            if (existing) {
                (0, response_js_1.sendError)(res, 'You have already registered for this event.', 'ALREADY_REGISTERED', 409);
                return;
            }
            // Fetch user profile
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                (0, response_js_1.sendError)(res, 'User profile not found.', 'USER_NOT_FOUND', 404);
                return;
            }
            // Generate unique registration code: AYX-YYYY-XXXXX
            const registrationCode = qr_service_js_1.QRService.generateRegistrationCode();
            // Create QR Payload
            const qrPayload = JSON.stringify({
                code: registrationCode,
                eventId: event.id,
                eventName: event.name,
                participantName: user.name,
                participantEmail: user.email,
                timestamp: new Date().toISOString(),
            });
            const registration = await prisma_js_1.prisma.registration.create({
                data: {
                    registrationCode,
                    eventId: event.id,
                    userId: user.id,
                    participantName: user.name,
                    participantEmail: user.email,
                    status: client_1.RegistrationStatus.CONFIRMED,
                    qrCodeData: qrPayload,
                },
                include: {
                    event: true,
                },
            });
            // If there is a fee, record transaction in Finance module
            if (event.registrationFee > 0) {
                await prisma_js_1.prisma.financeTransaction.create({
                    data: {
                        eventId: event.id,
                        description: `Ticket Registration (${registrationCode}) - ${user.name}`,
                        category: 'TicketSales',
                        amount: event.registrationFee,
                        type: client_1.TransactionType.INCOME,
                        status: 'COMPLETED',
                    },
                });
            }
            // Notification
            await prisma_js_1.prisma.notification.create({
                data: {
                    userId: user.id,
                    title: 'Registration Confirmed!',
                    message: `Your registration for "${event.name}" is confirmed with Pass Code: ${registrationCode}.`,
                    type: 'REGISTRATION',
                    link: '/my-qr',
                },
            });
            (0, response_js_1.sendSuccess)(res, registration, 'Registered successfully for the event!', 201);
        }
        catch (error) {
            console.error('Event registration error:', error);
            (0, response_js_1.sendError)(res, 'Failed to register for the event.', 'REGISTRATION_ERROR', 500);
        }
    }
    static async getEventRegistrations(req, res) {
        try {
            const { id: eventId } = req.params;
            const registrations = await prisma_js_1.prisma.registration.findMany({
                where: { eventId },
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true, department: true } },
                    attendance: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, registrations);
        }
        catch (error) {
            console.error('Get event registrations error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch registrations.', 'REGISTRATIONS_FETCH_ERROR', 500);
        }
    }
    static async getMyRegistrations(req, res) {
        try {
            const userId = req.user.userId;
            const registrations = await prisma_js_1.prisma.registration.findMany({
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
            (0, response_js_1.sendSuccess)(res, registrations);
        }
        catch (error) {
            console.error('Get my registrations error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch personal registrations.', 'MY_REGISTRATIONS_ERROR', 500);
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const registration = await prisma_js_1.prisma.registration.findFirst({
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
                (0, response_js_1.sendError)(res, 'Registration record not found.', 'NOT_FOUND', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, registration);
        }
        catch (error) {
            console.error('Get registration error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch registration.', 'REGISTRATION_FETCH_ERROR', 500);
        }
    }
}
exports.RegistrationController = RegistrationController;
