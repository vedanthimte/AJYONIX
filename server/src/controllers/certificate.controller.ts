import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { QRService } from '../services/qr.service.js';
import { PDFService } from '../services/pdf.service.js';

export class CertificateController {
  static async generate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { registrationId } = req.body;

      if (!registrationId) {
        sendError(res, 'Registration ID is required.', 'VALIDATION_ERROR', 400);
        return;
      }

      // 1. Fetch registration
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: true,
          user: true,
          certificate: true,
        },
      });

      if (!registration) {
        sendError(res, 'Registration not found.', 'NOT_FOUND', 404);
        return;
      }

      // Check if certificate already exists
      if (registration.certificate) {
        sendSuccess(res, registration.certificate, 'Certificate already exists');
        return;
      }

      const certificateCode = QRService.generateCertificateCode();
      const qrData = JSON.stringify({
        certId: certificateCode,
        student: registration.participantName,
        event: registration.event.name,
        status: 'VALID',
        verifyUrl: `http://localhost:5173/verify/${certificateCode}`,
      });

      const cert = await prisma.certificate.create({
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
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          title: 'Certificate Issued!',
          message: `Your Certificate of Participation for "${registration.event.name}" is now available.`,
          type: 'CERTIFICATE',
          link: `/verify/${certificateCode}`,
        },
      });

      sendSuccess(res, cert, 'Certificate generated successfully!', 201);
    } catch (error: any) {
      console.error('Generate certificate error:', error);
      sendError(res, 'Failed to generate certificate.', 'CERT_GEN_ERROR', 500);
    }
  }

  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cert = await prisma.certificate.findFirst({
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
        sendSuccess(
          res,
          {
            status: 'INVALID',
            message: `Certificate with identifier "${id}" could not be verified in the Ayojanix Registry.`,
          },
          'Verification completed: Certificate not found'
        );
        return;
      }

      sendSuccess(res, {
        status: cert.status || 'VALID',
        certificateCode: cert.certificateCode,
        participantName: cert.participantName,
        eventName: cert.eventName,
        issueDate: cert.issueDate,
        eventDetails: cert.event,
        registrationCode: cert.registration.registrationCode,
      });
    } catch (error: any) {
      console.error('Verify certificate error:', error);
      sendError(res, 'Verification failed.', 'VERIFY_ERROR', 500);
    }
  }

  static async getMyCertificates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const certificates = await prisma.certificate.findMany({
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

      sendSuccess(res, certificates);
    } catch (error: any) {
      console.error('Get my certificates error:', error);
      sendError(res, 'Failed to fetch user certificates.', 'CERT_FETCH_ERROR', 500);
    }
  }

  static async downloadPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cert = await prisma.certificate.findFirst({
        where: {
          OR: [{ id }, { certificateCode: id }],
        },
      });

      if (!cert) {
        sendError(res, 'Certificate not found.', 'NOT_FOUND', 404);
        return;
      }

      await PDFService.streamCertificatePDF(res, cert);
    } catch (error: any) {
      console.error('Certificate PDF download error:', error);
      sendError(res, 'Failed to download certificate PDF.', 'PDF_ERROR', 500);
    }
  }
}
