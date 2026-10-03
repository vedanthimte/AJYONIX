"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const pdf_service_js_1 = require("../services/pdf.service.js");
class ReportController {
    static async getSummaryReport(req, res) {
        try {
            const totalEvents = await prisma_js_1.prisma.event.count();
            const totalParticipants = await prisma_js_1.prisma.user.count({ where: { role: 'PARTICIPANT' } });
            const totalRegistrations = await prisma_js_1.prisma.registration.count();
            const totalAttendance = await prisma_js_1.prisma.attendance.count();
            const totalVolunteers = await prisma_js_1.prisma.volunteer.count();
            const totalVenues = await prisma_js_1.prisma.venue.count();
            const totalVendors = await prisma_js_1.prisma.vendor.count();
            const transactions = await prisma_js_1.prisma.financeTransaction.findMany();
            const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
            const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
            const feedbacks = await prisma_js_1.prisma.feedback.findMany();
            const avgRating = feedbacks.length
                ? Number((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(2))
                : 4.8;
            (0, response_js_1.sendSuccess)(res, {
                overview: {
                    totalEvents,
                    totalParticipants,
                    totalRegistrations,
                    totalAttendance,
                    totalVolunteers,
                    totalVenues,
                    totalVendors,
                    totalIncome,
                    totalExpense,
                    netBalance: totalIncome - totalExpense,
                    averageFeedbackRating: avgRating,
                },
            });
        }
        catch (error) {
            console.error('Summary report error:', error);
            (0, response_js_1.sendError)(res, 'Failed to generate summary report.', 'REPORT_ERROR', 500);
        }
    }
    static async getEventReport(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma_js_1.prisma.event.findUnique({
                where: { id },
                include: {
                    organizer: true,
                    venue: true,
                    registrations: {
                        include: { attendance: true, certificate: true },
                    },
                    volunteerAssignments: {
                        include: { volunteer: true },
                    },
                    financeTransactions: true,
                    feedback: true,
                },
            });
            if (!event) {
                (0, response_js_1.sendError)(res, 'Event not found.', 'NOT_FOUND', 404);
                return;
            }
            const totalRegs = event.registrations.length;
            const attendedCount = event.registrations.filter((r) => r.attendance.length > 0).length;
            const totalRevenue = event.financeTransactions
                .filter((t) => t.type === 'INCOME')
                .reduce((s, t) => s + t.amount, 0);
            const totalCost = event.financeTransactions
                .filter((t) => t.type === 'EXPENSE')
                .reduce((s, t) => s + t.amount, 0);
            (0, response_js_1.sendSuccess)(res, {
                event,
                analytics: {
                    registered: totalRegs,
                    attended: attendedCount,
                    attendanceRate: totalRegs > 0 ? `${Math.round((attendedCount / totalRegs) * 100)}%` : '0%',
                    revenue: totalRevenue,
                    cost: totalCost,
                    net: totalRevenue - totalCost,
                    certificatesIssued: event.registrations.filter((r) => r.certificate).length,
                    feedbackCount: event.feedback.length,
                },
            });
        }
        catch (error) {
            console.error('Event report error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch event report.', 'REPORT_ERROR', 500);
        }
    }
    static async downloadPDF(req, res) {
        try {
            const { id } = req.params;
            const event = await prisma_js_1.prisma.event.findUnique({
                where: { id },
                include: {
                    registrations: { include: { attendance: true } },
                    financeTransactions: true,
                    feedback: true,
                    volunteerAssignments: { include: { volunteer: true } },
                },
            });
            if (!event) {
                (0, response_js_1.sendError)(res, 'Event not found.', 'NOT_FOUND', 404);
                return;
            }
            const totalIncome = event.financeTransactions
                .filter((t) => t.type === 'INCOME')
                .reduce((s, t) => s + t.amount, 0);
            const totalExpense = event.financeTransactions
                .filter((t) => t.type === 'EXPENSE')
                .reduce((s, t) => s + t.amount, 0);
            await pdf_service_js_1.PDFService.streamReportPDF(res, {
                title: `Comprehensive Audit: ${event.name}`,
                subtitle: `Date: ${new Date(event.date).toLocaleDateString()} | Venue: ${event.venueName || 'Campus'} | Status: ${event.status}`,
                generatedAt: new Date(),
                sections: [
                    {
                        title: '1. Participant & Attendance Metrics',
                        lines: [
                            `Total Registrations: ${event.registrations.length} / Capacity: ${event.capacity}`,
                            `Verified Attendance (Checked-in): ${event.registrations.filter((r) => r.attendance.length > 0).length}`,
                            `Capacity Utilization Rate: ${Math.round((event.registrations.length / event.capacity) * 100)}%`,
                        ],
                    },
                    {
                        title: '2. Financial Performance',
                        lines: [
                            `Total Revenue Collected: INR ${totalIncome.toLocaleString('en-IN')}`,
                            `Total Expenditures Incurred: INR ${totalExpense.toLocaleString('en-IN')}`,
                            `Net Financial Balance: INR ${(totalIncome - totalExpense).toLocaleString('en-IN')}`,
                        ],
                    },
                    {
                        title: '3. Volunteer Staffing & Operations',
                        lines: [
                            `Volunteers Deployed: ${event.volunteerAssignments.length} personnel`,
                            ...event.volunteerAssignments.map((v) => `${v.volunteer.name}: ${v.duty} (${v.shift})`),
                        ],
                    },
                    {
                        title: '4. Participant Feedback & Quality Score',
                        lines: [
                            `Total Reviews Submitted: ${event.feedback.length}`,
                            `Average Rating: ${event.feedback.length
                                ? (event.feedback.reduce((s, f) => s + f.rating, 0) / event.feedback.length).toFixed(2)
                                : 'N/A'} / 5.0 Stars`,
                        ],
                    },
                ],
            });
        }
        catch (error) {
            console.error('Download report PDF error:', error);
            (0, response_js_1.sendError)(res, 'Failed to download report PDF.', 'PDF_ERROR', 500);
        }
    }
}
exports.ReportController = ReportController;
