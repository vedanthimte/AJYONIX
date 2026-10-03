"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const client_1 = require("@prisma/client");
class AttendanceController {
    /**
     * Check-in participant via QR Code data or manual registration code
     */
    static async checkIn(req, res) {
        try {
            const { qrData, registrationCode, eventId } = req.body;
            const scannerName = req.user?.name || 'Gate Scanner';
            let targetCode = registrationCode;
            // Extract code if JSON qrData is supplied
            if (qrData) {
                try {
                    const parsed = JSON.parse(qrData);
                    if (parsed.code)
                        targetCode = parsed.code;
                }
                catch {
                    // If not JSON, treat raw string as code
                    targetCode = qrData.trim();
                }
            }
            if (!targetCode) {
                (0, response_js_1.sendError)(res, 'Registration Code or QR Data is required.', 'VALIDATION_ERROR', 400);
                return;
            }
            // 1. Find Registration
            const registration = await prisma_js_1.prisma.registration.findFirst({
                where: {
                    OR: [{ registrationCode: targetCode }, { id: targetCode }],
                },
                include: {
                    event: true,
                    user: true,
                    attendance: {
                        orderBy: { checkInTime: 'desc' },
                        take: 1,
                    },
                },
            });
            if (!registration) {
                (0, response_js_1.sendError)(res, `Invalid QR Pass. No registration found for code "${targetCode}".`, 'INVALID_PASS', 404);
                return;
            }
            // 2. Validate Event match if eventId is provided
            if (eventId && registration.eventId !== eventId) {
                (0, response_js_1.sendError)(res, `Pass is valid for "${registration.event.name}", NOT the selected event.`, 'EVENT_MISMATCH', 400);
                return;
            }
            // 3. Check duplicate attendance
            const latestAttendance = registration.attendance[0];
            if (latestAttendance && latestAttendance.status === client_1.AttendanceStatus.CHECKED_IN && !latestAttendance.checkOutTime) {
                (0, response_js_1.sendError)(res, `Participant ${registration.participantName} is ALREADY checked in (at ${new Date(latestAttendance.checkInTime).toLocaleTimeString()}).`, 'DUPLICATE_ATTENDANCE', 409);
                return;
            }
            // 4. Record Check-In
            const newAttendance = await prisma_js_1.prisma.attendance.create({
                data: {
                    registrationId: registration.id,
                    eventId: registration.eventId,
                    userId: registration.userId,
                    status: client_1.AttendanceStatus.CHECKED_IN,
                    checkInTime: new Date(),
                    scannedBy: scannerName,
                },
            });
            // Update registration status to ATTENDED
            await prisma_js_1.prisma.registration.update({
                where: { id: registration.id },
                data: { status: client_1.RegistrationStatus.ATTENDED },
            });
            // In-app notification to participant
            await prisma_js_1.prisma.notification.create({
                data: {
                    userId: registration.userId,
                    title: 'Checked In Successfully!',
                    message: `Your attendance at "${registration.event.name}" was verified at ${new Date().toLocaleTimeString()}.`,
                    type: 'ATTENDANCE',
                },
            });
            (0, response_js_1.sendSuccess)(res, {
                attendance: newAttendance,
                participant: {
                    name: registration.participantName,
                    email: registration.participantEmail,
                    department: registration.user.department,
                    phone: registration.user.phone,
                },
                event: {
                    id: registration.event.id,
                    name: registration.event.name,
                    venue: registration.event.venueName,
                },
                registrationCode: registration.registrationCode,
                time: newAttendance.checkInTime,
                status: 'CHECKED_IN',
            }, `Check-in verified for ${registration.participantName}!`);
        }
        catch (error) {
            console.error('Check-in error:', error);
            (0, response_js_1.sendError)(res, 'Failed to process attendance check-in.', 'CHECKIN_ERROR', 500);
        }
    }
    /**
     * Check-out participant
     */
    static async checkOut(req, res) {
        try {
            const { qrData, registrationCode, eventId } = req.body;
            let targetCode = registrationCode;
            if (qrData) {
                try {
                    const parsed = JSON.parse(qrData);
                    if (parsed.code)
                        targetCode = parsed.code;
                }
                catch {
                    targetCode = qrData.trim();
                }
            }
            const registration = await prisma_js_1.prisma.registration.findFirst({
                where: {
                    OR: [{ registrationCode: targetCode }, { id: targetCode }],
                },
                include: {
                    event: true,
                    attendance: {
                        where: { status: client_1.AttendanceStatus.CHECKED_IN, checkOutTime: null },
                        orderBy: { checkInTime: 'desc' },
                        take: 1,
                    },
                },
            });
            if (!registration) {
                (0, response_js_1.sendError)(res, 'No registration record found.', 'NOT_FOUND', 404);
                return;
            }
            if (eventId && registration.eventId !== eventId) {
                (0, response_js_1.sendError)(res, 'Event mismatch.', 'EVENT_MISMATCH', 400);
                return;
            }
            const activeRecord = registration.attendance[0];
            if (!activeRecord) {
                (0, response_js_1.sendError)(res, 'Participant has not checked in or is already checked out.', 'NOT_CHECKED_IN', 400);
                return;
            }
            const updated = await prisma_js_1.prisma.attendance.update({
                where: { id: activeRecord.id },
                data: {
                    status: client_1.AttendanceStatus.CHECKED_OUT,
                    checkOutTime: new Date(),
                },
            });
            (0, response_js_1.sendSuccess)(res, {
                attendance: updated,
                participantName: registration.participantName,
                event: registration.event.name,
                checkOutTime: updated.checkOutTime,
                status: 'CHECKED_OUT',
            }, `Check-out logged for ${registration.participantName}`);
        }
        catch (error) {
            console.error('Check-out error:', error);
            (0, response_js_1.sendError)(res, 'Failed to log check-out.', 'CHECKOUT_ERROR', 500);
        }
    }
    /**
     * Attendance statistics and audit logs for an event
     */
    static async getEventAttendance(req, res) {
        try {
            const { id: eventId } = req.params;
            const event = await prisma_js_1.prisma.event.findUnique({
                where: { id: eventId },
                select: { id: true, name: true, capacity: true },
            });
            if (!event) {
                (0, response_js_1.sendError)(res, 'Event not found.', 'NOT_FOUND', 404);
                return;
            }
            const totalRegistered = await prisma_js_1.prisma.registration.count({ where: { eventId } });
            const attendanceRecords = await prisma_js_1.prisma.attendance.findMany({
                where: { eventId },
                include: {
                    registration: { select: { registrationCode: true, participantName: true, participantEmail: true } },
                    user: { select: { department: true } },
                },
                orderBy: { checkInTime: 'desc' },
            });
            const totalCheckedIn = attendanceRecords.length;
            const checkedOut = attendanceRecords.filter((a) => a.checkOutTime !== null).length;
            const currentlyInside = totalCheckedIn - checkedOut;
            const attendancePercentage = totalRegistered > 0 ? Number(((totalCheckedIn / totalRegistered) * 100).toFixed(1)) : 0;
            (0, response_js_1.sendSuccess)(res, {
                event,
                stats: {
                    totalRegistered,
                    totalCheckedIn,
                    checkedOut,
                    currentlyInside,
                    attendancePercentage,
                },
                logs: attendanceRecords,
            });
        }
        catch (error) {
            console.error('Get event attendance error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch attendance stats.', 'ATTENDANCE_FETCH_ERROR', 500);
        }
    }
}
exports.AttendanceController = AttendanceController;
