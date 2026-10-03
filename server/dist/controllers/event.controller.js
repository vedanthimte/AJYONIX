"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const client_1 = require("@prisma/client");
class EventController {
    static async getAll(req, res) {
        try {
            const { search, type, status, limit, offset } = req.query;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: String(search) } },
                    { description: { contains: String(search) } },
                    { venueName: { contains: String(search) } },
                ];
            }
            if (type && type !== 'ALL') {
                where.type = type;
            }
            if (status && status !== 'ALL') {
                where.status = status;
            }
            const events = await prisma_js_1.prisma.event.findMany({
                where,
                include: {
                    organizer: { select: { id: true, name: true, email: true, department: true } },
                    venue: { select: { id: true, name: true, location: true, capacity: true } },
                    _count: {
                        select: {
                            registrations: true,
                            attendance: true,
                            feedback: true,
                        },
                    },
                },
                orderBy: { date: 'asc' },
                take: limit ? Number(limit) : 50,
                skip: offset ? Number(offset) : 0,
            });
            (0, response_js_1.sendSuccess)(res, events);
        }
        catch (error) {
            console.error('Get all events error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch events.', 'EVENTS_FETCH_ERROR', 500);
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma_js_1.prisma.event.findUnique({
                where: { id },
                include: {
                    organizer: { select: { id: true, name: true, email: true, phone: true } },
                    venue: true,
                    volunteerAssignments: {
                        include: { volunteer: true },
                    },
                    announcements: {
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            registrations: true,
                            attendance: true,
                            feedback: true,
                        },
                    },
                },
            });
            if (!event) {
                (0, response_js_1.sendError)(res, 'Event not found.', 'NOT_FOUND', 404);
                return;
            }
            (0, response_js_1.sendSuccess)(res, event);
        }
        catch (error) {
            console.error('Get event error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch event details.', 'EVENT_FETCH_ERROR', 500);
        }
    }
    static async create(req, res) {
        try {
            const { name, description, type, date, startTime, endTime, venueId, capacity, registrationFee, image, registrationOpen, registrationClose, status, } = req.body;
            if (!name || !description || !date || !startTime || !endTime) {
                (0, response_js_1.sendError)(res, 'Event name, description, date, and times are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            let venueName = 'Main Campus Venue';
            if (venueId) {
                const venue = await prisma_js_1.prisma.venue.findUnique({ where: { id: venueId } });
                if (venue) {
                    venueName = venue.name;
                }
            }
            const event = await prisma_js_1.prisma.event.create({
                data: {
                    name,
                    description,
                    type: type || client_1.EventType.OTHER,
                    date: new Date(date),
                    startTime,
                    endTime,
                    venueId: venueId || null,
                    venueName,
                    capacity: Number(capacity) || 100,
                    registrationFee: Number(registrationFee) || 0,
                    organizerId: req.user.userId,
                    image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
                    status: status || client_1.EventStatus.PUBLISHED,
                    registrationOpen: registrationOpen ? new Date(registrationOpen) : new Date(),
                    registrationClose: registrationClose ? new Date(registrationClose) : null,
                },
                include: {
                    venue: true,
                    organizer: { select: { id: true, name: true, email: true } },
                },
            });
            (0, response_js_1.sendSuccess)(res, event, 'Event created successfully', 201);
        }
        catch (error) {
            console.error('Create event error:', error);
            (0, response_js_1.sendError)(res, 'Failed to create event.', 'EVENT_CREATE_ERROR', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            if (data.date)
                data.date = new Date(data.date);
            if (data.registrationOpen)
                data.registrationOpen = new Date(data.registrationOpen);
            if (data.registrationClose)
                data.registrationClose = new Date(data.registrationClose);
            if (data.capacity)
                data.capacity = Number(data.capacity);
            if (data.registrationFee !== undefined)
                data.registrationFee = Number(data.registrationFee);
            if (data.venueId) {
                const venue = await prisma_js_1.prisma.venue.findUnique({ where: { id: data.venueId } });
                if (venue)
                    data.venueName = venue.name;
            }
            const updated = await prisma_js_1.prisma.event.update({
                where: { id },
                data,
            });
            (0, response_js_1.sendSuccess)(res, updated, 'Event updated successfully');
        }
        catch (error) {
            console.error('Update event error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update event.', 'EVENT_UPDATE_ERROR', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.event.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Event deleted successfully');
        }
        catch (error) {
            console.error('Delete event error:', error);
            (0, response_js_1.sendError)(res, 'Failed to delete event.', 'EVENT_DELETE_ERROR', 500);
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!Object.values(client_1.EventStatus).includes(status)) {
                (0, response_js_1.sendError)(res, 'Invalid event status provided.', 'INVALID_STATUS', 400);
                return;
            }
            const updated = await prisma_js_1.prisma.event.update({
                where: { id },
                data: { status },
            });
            (0, response_js_1.sendSuccess)(res, updated, `Event status updated to ${status}`);
        }
        catch (error) {
            console.error('Update status error:', error);
            (0, response_js_1.sendError)(res, 'Failed to update event status.', 'STATUS_UPDATE_ERROR', 500);
        }
    }
}
exports.EventController = EventController;
