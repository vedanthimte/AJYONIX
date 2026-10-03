"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
class VolunteerController {
    static async getAll(req, res) {
        try {
            const volunteers = await prisma_js_1.prisma.volunteer.findMany({
                include: {
                    assignments: {
                        include: { event: { select: { id: true, name: true, date: true } } },
                    },
                },
                orderBy: { name: 'asc' },
            });
            (0, response_js_1.sendSuccess)(res, volunteers);
        }
        catch (error) {
            console.error('Get volunteers error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch volunteers.', 'VOLUNTEER_FETCH_ERROR', 500);
        }
    }
    static async create(req, res) {
        try {
            const { name, email, phone, skills, availability, department } = req.body;
            if (!name || !email) {
                (0, response_js_1.sendError)(res, 'Name and email are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const volunteer = await prisma_js_1.prisma.volunteer.create({
                data: {
                    name,
                    email,
                    phone: phone || '',
                    skills: skills || 'General Assistance',
                    availability: availability || 'Available',
                    department: department || 'General',
                },
            });
            (0, response_js_1.sendSuccess)(res, volunteer, 'Volunteer added successfully', 201);
        }
        catch (error) {
            console.error('Create volunteer error:', error);
            (0, response_js_1.sendError)(res, 'Failed to create volunteer profile.', 'VOLUNTEER_CREATE_ERROR', 500);
        }
    }
    static async assignDuty(req, res) {
        try {
            const { eventId, volunteerId, duty, shift } = req.body;
            if (!eventId || !volunteerId || !duty || !shift) {
                (0, response_js_1.sendError)(res, 'Event, volunteer, duty, and shift are required.', 'VALIDATION_ERROR', 400);
                return;
            }
            const assignment = await prisma_js_1.prisma.volunteerAssignment.create({
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
                await prisma_js_1.prisma.notification.create({
                    data: {
                        userId: assignment.volunteer.userId,
                        title: 'New Duty Assignment',
                        message: `You are assigned to "${duty}" (${shift}) for event "${assignment.event.name}".`,
                        type: 'DUTY',
                        link: '/volunteer/duties',
                    },
                });
            }
            (0, response_js_1.sendSuccess)(res, assignment, 'Duty assigned successfully', 201);
        }
        catch (error) {
            console.error('Assign duty error:', error);
            (0, response_js_1.sendError)(res, 'Failed to assign duty.', 'ASSIGNMENT_ERROR', 500);
        }
    }
    static async getMyDuties(req, res) {
        try {
            const userId = req.user.userId;
            const volunteer = await prisma_js_1.prisma.volunteer.findUnique({
                where: { userId },
            });
            if (!volunteer) {
                // Volunteer record might not be linked, or user has email matching volunteer
                const volunteerByEmail = await prisma_js_1.prisma.volunteer.findFirst({
                    where: { email: req.user.email },
                });
                if (!volunteerByEmail) {
                    (0, response_js_1.sendSuccess)(res, []);
                    return;
                }
                const assignments = await prisma_js_1.prisma.volunteerAssignment.findMany({
                    where: { volunteerId: volunteerByEmail.id },
                    include: {
                        event: {
                            include: { venue: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                });
                (0, response_js_1.sendSuccess)(res, assignments);
                return;
            }
            const assignments = await prisma_js_1.prisma.volunteerAssignment.findMany({
                where: { volunteerId: volunteer.id },
                include: {
                    event: {
                        include: { venue: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, assignments);
        }
        catch (error) {
            console.error('Get my duties error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch duty assignments.', 'DUTIES_FETCH_ERROR', 500);
        }
    }
    static async deleteAssignment(req, res) {
        try {
            const { id } = req.params;
            await prisma_js_1.prisma.volunteerAssignment.delete({
                where: { id },
            });
            (0, response_js_1.sendSuccess)(res, null, 'Duty assignment removed');
        }
        catch (error) {
            console.error('Delete assignment error:', error);
            (0, response_js_1.sendError)(res, 'Failed to delete assignment.', 'DELETE_ERROR', 500);
        }
    }
}
exports.VolunteerController = VolunteerController;
