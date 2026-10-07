import PDFDocument from 'pdfkit';
import { Response } from 'express';
import QRCode from 'qrcode';

export class PDFService {
  /**
   * Generates and streams an official Ayojanix Invoice PDF
   */
  static async streamInvoicePDF(
    res: Response,
    invoice: {
      invoiceNumber: string;
      recipientName: string;
      recipientEmail: string;
      description: string;
      amount: number;
      paymentStatus: string;
      date: Date;
      event?: { name: string } | null;
      vendor?: { name: string; category: string } | null;
    }
  ): Promise<void> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Ayojanix_Invoice_${invoice.invoiceNumber}.pdf"`
    );

    doc.pipe(res);

    // Header Branding
    doc.fillColor('#1e1b4b').fontSize(26).text('AYOJANIX', 50, 50, { bold: true } as any);
    doc.fillColor('#6366f1').fontSize(11).text('Smart College Event Management System', 50, 80);
    doc.fillColor('#64748b').fontSize(9).text('Prof. Ram Meghe Institute of Tech & Research, Badnera', 50, 95);

    // Invoice Status Badge
    doc.rect(420, 50, 125, 30).fill('#e0e7ff');
    doc.fillColor('#3730a3').fontSize(11).text(`STATUS: ${invoice.paymentStatus}`, 425, 60, { width: 115, align: 'center' });

    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#e2e8f0').stroke();

    // Invoice Meta
    doc.fillColor('#0f172a').fontSize(16).text('OFFICIAL INVOICE', 50, 140);
    doc.fillColor('#475569').fontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 50, 165);
    doc.text(`Date of Issue: ${new Date(invoice.date).toLocaleDateString()}`, 50, 180);
    if (invoice.event) {
      doc.text(`Associated Event: ${invoice.event.name}`, 50, 195);
    }

    // Bill To
    doc.fillColor('#0f172a').fontSize(12).text('Billed To / Payee:', 320, 140);
    doc.fillColor('#475569').fontSize(10);
    doc.text(invoice.recipientName, 320, 160);
    doc.text(invoice.recipientEmail, 320, 175);
    if (invoice.vendor) {
      doc.text(`Vendor Category: ${invoice.vendor.category}`, 320, 190);
    }

    // Table Header
    const tableTop = 235;
    doc.rect(50, tableTop, 495, 25).fill('#f1f5f9');
    doc.fillColor('#1e293b').fontSize(10);
    doc.text('DESCRIPTION / LINE ITEM', 65, tableTop + 7);
    doc.text('AMOUNT (INR)', 420, tableTop + 7, { align: 'right', width: 110 });

    // Table Row
    const rowTop = tableTop + 35;
    doc.fillColor('#334155').fontSize(10);
    doc.text(invoice.description, 65, rowTop, { width: 340 });
    doc.text(`INR ${invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 420, rowTop, {
      align: 'right',
      width: 110,
    });

    // Divider
    doc.moveTo(50, rowTop + 40).lineTo(545, rowTop + 40).strokeColor('#cbd5e1').stroke();

    // Total
    doc.fillColor('#0f172a').fontSize(12).text('Total Amount Paid:', 300, rowTop + 55);
    doc.fillColor('#4338ca').fontSize(14).text(`INR ${invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 420, rowTop + 53, {
      align: 'right',
      width: 110,
    });

    // Footer
    const footerTop = 680;
    doc.rect(50, footerTop, 495, 1).fill('#e2e8f0');
    doc.fillColor('#64748b').fontSize(8).text(
      'This is an authorized computer-generated document issued by the Ayojanix Campus Management Core. No physical signature required.',
      50,
      footerTop + 15,
      { align: 'center', width: 495 }
    );

    doc.end();
  }

  /**
   * Generates and streams an Official Certificate of Participation PDF
   */
  static async streamCertificatePDF(
    res: Response,
    certificate: {
      certificateCode: string;
      participantName: string;
      eventName: string;
      issueDate: Date;
      status: string;
    }
  ): Promise<void> {
    // Landscape A4 for certificate
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 40,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Ayojanix_Certificate_${certificate.certificateCode}.pdf"`
    );

    doc.pipe(res);

    // Decorative Borders
    const width = doc.page.width;
    const height = doc.page.height;

    // Outer Navy Border
    doc.rect(20, 20, width - 40, height - 40).lineWidth(4).strokeColor('#1e1b4b').stroke();
    // Inner Indigo Border
    doc.rect(26, 26, width - 52, height - 52).lineWidth(1).strokeColor('#6366f1').stroke();

    // Top Header
    doc.fillColor('#4338ca').fontSize(16).text('PROF. RAM MEGHE INSTITUTE OF TECHNOLOGY & RESEARCH', 0, 60, {
      align: 'center',
    });
    doc.fillColor('#64748b').fontSize(10).text('Department of Computer Science & Engineering | Ayojanix Campus Network', 0, 82, {
      align: 'center',
    });

    // Certificate Title
    doc.fillColor('#1e1b4b').fontSize(32).text('CERTIFICATE OF PARTICIPATION', 0, 125, {
      align: 'center',
      bold: true,
    } as any);

    doc.fillColor('#64748b').fontSize(12).text('THIS IS PROUDLY PRESENTED TO', 0, 175, {
      align: 'center',
    });

    // Participant Name
    doc.fillColor('#312e81').fontSize(26).text(certificate.participantName, 0, 205, {
      align: 'center',
      bold: true,
    } as any);

    // Underline for participant name
    doc.moveTo(width / 2 - 180, 240).lineTo(width / 2 + 180, 240).strokeColor('#c7d2fe').lineWidth(1.5).stroke();

    // Body text
    doc.fillColor('#334155').fontSize(12).text(
      `for successfully participating in the collegiate event`,
      0,
      255,
      { align: 'center' }
    );

    // Event Name
    doc.fillColor('#4338ca').fontSize(20).text(certificate.eventName, 0, 280, {
      align: 'center',
      bold: true,
    } as any);

    doc.fillColor('#64748b').fontSize(11).text(
      `Conducted on ${new Date(certificate.issueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      0,
      315,
      { align: 'center' }
    );

    // Verification QR code on certificate
    const verifyUrl = `http://localhost:5173/verify/${certificate.certificateCode}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 90, margin: 1 });
    doc.image(qrBuffer, 80, 410, { width: 80 });

    doc.fillColor('#475569').fontSize(8).text(`Scan to Verify`, 80, 495, { width: 80, align: 'center' });
    doc.text(`ID: ${certificate.certificateCode}`, 60, 508, { width: 120, align: 'center' });

    // Signatures
    // Convener
    doc.moveTo(width - 450, 470).lineTo(width - 310, 470).strokeColor('#94a3b8').lineWidth(1).stroke();
    doc.fillColor('#1e293b').fontSize(11).text('Prof. Vedant Himte', width - 450, 478, { width: 140, align: 'center' });
    doc.fillColor('#64748b').fontSize(9).text('Event Convener', width - 450, 492, { width: 140, align: 'center' });

    // Dean / Principal
    doc.moveTo(width - 240, 470).lineTo(width - 100, 470).strokeColor('#94a3b8').lineWidth(1).stroke();
    doc.fillColor('#1e293b').fontSize(11).text('Dr. S. P. Akarte', width - 240, 478, { width: 140, align: 'center' });
    doc.fillColor('#64748b').fontSize(9).text('Faculty Guide / Dean', width - 240, 492, { width: 140, align: 'center' });

    doc.end();
  }

  /**
   * Generates and streams an Event Summary or Finance Report PDF
   */
  static async streamReportPDF(
    res: Response,
    reportData: {
      title: string;
      subtitle: string;
      generatedAt: Date;
      sections: { title: string; lines: string[] }[];
    }
  ): Promise<void> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Ayojanix_Report_${Date.now()}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc.fillColor('#1e1b4b').fontSize(22).text('AYOJANIX EVENT ANALYTICS & AUDIT', 50, 50);
    doc.fillColor('#6366f1').fontSize(12).text(reportData.title, 50, 80);
    doc.fillColor('#64748b').fontSize(10).text(reportData.subtitle, 50, 98);
    doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 50, 114);

    doc.moveTo(50, 135).lineTo(545, 135).strokeColor('#cbd5e1').stroke();

    let currentY = 155;

    for (const sec of reportData.sections) {
      if (currentY > 680) {
        doc.addPage();
        currentY = 50;
      }

      doc.fillColor('#1e293b').fontSize(13).text(sec.title, 50, currentY);
      currentY += 22;

      doc.fillColor('#334155').fontSize(10);
      for (const line of sec.lines) {
        doc.text(`•  ${line}`, 65, currentY);
        currentY += 18;
      }
      currentY += 12;
    }

    doc.end();
  }

  /**
   * Generates and streams an Official Ayojanix Digital Event Pass PDF with Scannable QR Code
   */
  static async streamEventPassPDF(
    res: Response,
    registration: {
      registrationCode: string;
      participantName: string;
      participantEmail: string;
      status: string;
      event: {
        name: string;
        date: Date;
        startTime: string;
        endTime: string;
        venueName?: string | null;
        registrationFee?: number;
      };
      user?: {
        department?: string | null;
        phone?: string | null;
      } | null;
    }
  ): Promise<void> {
    const doc = new PDFDocument({
      size: [360, 540], // Compact A6-style badge pass
      margin: 24,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Ayojanix_Pass_${registration.registrationCode}.pdf"`
    );

    doc.pipe(res);

    const width = 360;
    const height = 540;

    // Header Background
    doc.rect(0, 0, width, 105).fill('#1e1b4b');

    // Accent Line
    doc.rect(0, 105, width, 4).fill('#6366f1');

    // Title in Header
    doc.fillColor('#818cf8').fontSize(9).text('AYOJANIX SMART EVENT CORE • PRMITR', 24, 20, { align: 'center', width: width - 48 });
    doc.fillColor('#ffffff').fontSize(16).text('OFFICIAL DIGITAL EVENT PASS', 24, 36, { align: 'center', width: width - 48, bold: true } as any);
    doc.fillColor('#cbd5e1').fontSize(8.5).text('Fast Track Verification & Admission Checkpoint', 24, 58, { align: 'center', width: width - 48 });

    // Status Pill in Header
    doc.roundedRect(width / 2 - 50, 76, 100, 18, 9).fill('#4f46e5');
    doc.fillColor('#ffffff').fontSize(8).text(`STATUS: ${registration.status}`, width / 2 - 50, 81, { align: 'center', width: 100 });

    // Participant Name Box
    doc.fillColor('#0f172a').fontSize(16).text(registration.participantName, 24, 125, { align: 'center', width: width - 48, bold: true } as any);
    doc.fillColor('#4f46e5').fontSize(11).text(registration.registrationCode, 24, 146, { align: 'center', width: width - 48 });
    doc.fillColor('#64748b').fontSize(9).text(registration.participantEmail, 24, 162, { align: 'center', width: width - 48 });

    // Event Info Card Box
    doc.roundedRect(24, 182, width - 48, 80, 8).fill('#f8fafc');
    doc.roundedRect(24, 182, width - 48, 80, 8).lineWidth(1).strokeColor('#e2e8f0').stroke();

    doc.fillColor('#1e293b').fontSize(11).text(registration.event.name, 36, 192, { width: width - 72, align: 'center', bold: true } as any);

    const eventDateStr = new Date(registration.event.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    doc.fillColor('#475569').fontSize(8.5).text(`Date & Time: ${eventDateStr} • ${registration.event.startTime} - ${registration.event.endTime}`, 36, 216, { width: width - 72, align: 'center' });
    doc.fillColor('#475569').fontSize(8.5).text(`Venue: ${registration.event.venueName || 'Campus Main Auditorium'}`, 36, 232, { width: width - 72, align: 'center' });
    if (registration.user?.department) {
      doc.fillColor('#6366f1').fontSize(8).text(`Department: ${registration.user.department}`, 36, 247, { width: width - 72, align: 'center' });
    }

    // High-Resolution Scannable QR Code
    const qrBuffer = await QRCode.toBuffer(registration.registrationCode, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const qrX = width / 2 - 70;
    const qrY = 276;
    doc.roundedRect(qrX - 8, qrY - 8, 156, 156, 10).fill('#ffffff');
    doc.roundedRect(qrX - 8, qrY - 8, 156, 156, 10).lineWidth(1.5).strokeColor('#c7d2fe').stroke();
    doc.image(qrBuffer, qrX, qrY, { width: 140, height: 140 });

    doc.fillColor('#64748b').fontSize(8).text('Scan with Ayojanix Gate Scanner at Venue Entry', 24, 442, { align: 'center', width: width - 48 });

    // Decorative Cutout / Perforation Dots
    doc.moveTo(24, 462).lineTo(width - 24, 462).strokeColor('#cbd5e1').dash(3, { space: 3 }).stroke();
    doc.undash();

    // Verification Station Protocol Notice
    doc.fillColor('#94a3b8').fontSize(7.5).text('This is an authentic computer-verified pass. Present on mobile screen or printout.', 24, 474, { align: 'center', width: width - 48 });
    doc.fillColor('#4338ca').fontSize(7.5).text('Prof. Ram Meghe Institute of Technology & Research, Badnera (CSE Event Cell)', 24, 488, { align: 'center', width: width - 48 });

    doc.end();
  }
}
