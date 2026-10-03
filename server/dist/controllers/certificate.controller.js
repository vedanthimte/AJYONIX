"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const response_js_1 = require("../utils/response.js");
const qr_service_js_1 = require("../services/qr.service.js");
const pdf_service_js_1 = require("../services/pdf.service.js");
class CertificateController {
    static async generate(req, res) {
        try {
            const { registrationId } = req.body;
            if (!registrationId) {
                (0, response_js_1.sendError)(res, 'Registration ID is required.', 'VALIDATION_ERROR', 400);
                return;
            }
            // 1. Fetch registration
            const registration = await prisma_js_1.prisma.registration.findUnique({
                where: { id: registrationId },
                include: {
                    event: true,
                    user: true,
                    certificate: true,
                },
            });
            if (!registration) {
                (0, response_js_1.sendError)(res, 'Registration not found.', 'NOT_FOUND', 404);
                return;
            }
            // Check if certificate already exists
            if (registration.certificate) {
                (0, response_js_1.sendSuccess)(res, registration.certificate, 'Certificate already exists');
                return;
            }
            const certificateCode = qr_service_js_1.QRService.generateCertificateCode();
            const qrData = JSON.stringify({
                certId: certificateCode,
                student: registration.participantName,
                event: registration.event.name,
                status: 'VALID',
                verifyUrl: `http://localhost:5173/verify/${certificateCode}`,
            });
            const cert = await prisma_js_1.prisma.certificate.create({
                data: {
                    certificateCode,
                    eventId: registration.eventId,
                    registrationId: registration.id,
                    participantName: registration.participantName,
                    eventName: registration.event.name,
                    issueDate: new Date(),
                    qrCodeData: qrData,
                    status: 'VALID',
                },
                include: {
                    event: true,
                },
            });
            // Notify participant
            await prisma_js_1.prisma.notification.create({
                data: {
                    userId: registration.userId,
                    title: 'Certificate Issued!',
                    message: `Your Certificate of Participation for "${registration.event.name}" is now available.`,
                    type: 'CERTIFICATE',
                    link: `/verify/${certificateCode}`,
                },
            });
            (0, response_js_1.sendSuccess)(res, cert, 'Certificate generated successfully!', 201);
        }
        catch (error) {
            console.error('Generate certificate error:', error);
            (0, response_js_1.sendError)(res, 'Failed to generate certificate.', 'CERT_GEN_ERROR', 500);
        }
    }
    static async verify(req, res) {
        try {
            const { id } = req.params;
            const cert = await prisma_js_1.prisma.certificate.findFirst({
                where: {
                    OR: [{ id }, { certificateCode: id }],
                },
                include: {
                    event: {
                        select: { id: true, name: true, date: true, type: true, venueName: true },
                    },
                    registration: {
                        select: { registrationCode: true, participantEmail: true },
                    },
                },
            });
            if (!cert) {
                (0, response_js_1.sendSuccess)(res, {
                    status: 'INVALID',
                    message: `Certificate with identifier "${id}" could not be verified in the Ayojanix Registry.`,
                }, 'Verification completed: Certificate not found');
                return;
            }
            (0, response_js_1.sendSuccess)(res, {
                status: cert.status || 'VALID',
                certificateCode: cert.certificateCode,
                participantName: cert.participantName,
                eventName: cert.eventName,
                issueDate: cert.issueDate,
                eventDetails: cert.event,
                registrationCode: cert.registration.registrationCode,
            });
        }
        catch (error) {
            console.error('Verify certificate error:', error);
            (0, response_js_1.sendError)(res, 'Verification failed.', 'VERIFY_ERROR', 500);
        }
    }
    static async getMyCertificates(req, res) {
        try {
            const userId = req.user.userId;
            const certificates = await prisma_js_1.prisma.certificate.findMany({
                where: {
                    registration: {
                        userId,
                    },
                },
                include: {
                    event: true,
                },
                orderBy: { issueDate: 'desc' },
            });
            (0, response_js_1.sendSuccess)(res, certificates);
        }
        catch (error) {
            console.error('Get my certificates error:', error);
            (0, response_js_1.sendError)(res, 'Failed to fetch user certificates.', 'CERT_FETCH_ERROR', 500);
        }
    }
    static async downloadPDF(req, res) {
        try {
            const { id } = req.params;
            const cert = await prisma_js_1.prisma.certificate.findFirst({
                where: {
                    OR: [{ id }, { certificateCode: id }],
                },
            });
            if (!cert) {
                (0, response_js_1.sendError)(res, 'Certificate not found.', 'NOT_FOUND', 404);
                return;
            }
            await pdf_service_js_1.PDFService.streamCertificatePDF(res, cert);
        }
        catch (error) {
            console.error('Certificate PDF download error:', error);
            (0, response_js_1.sendError)(res, 'Failed to download certificate PDF.', 'PDF_ERROR', 500);
        }
    }
}
exports.CertificateController = CertificateController;
