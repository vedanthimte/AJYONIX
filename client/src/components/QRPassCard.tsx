import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Registration } from '../types';
import { Sparkles, Calendar, MapPin, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface QRPassCardProps {
  registration: Registration;
}

export const QRPassCard: React.FC<QRPassCardProps> = ({ registration }) => {
  const event = registration.event;

  const downloadPassPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150], // Badge size
    });

    // Dark header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 100, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AYOJANIX EVENT PASS', 50, 14, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('PRMITR Campus Network', 50, 22, { align: 'center' });

    // Participant Name
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(registration.participantName, 50, 44, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(registration.registrationCode, 50, 51, { align: 'center' });

    // Event Name
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(event?.name || 'College Event', 50, 62, { align: 'center', maxWidth: 85 });

    // Date & Venue
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    if (event?.date) {
      doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 50, 74, { align: 'center' });
    }
    if (event?.venueName) {
      doc.text(`Venue: ${event.venueName}`, 50, 80, { align: 'center', maxWidth: 85 });
    }

    // QR instructions
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Present this pass at entry station', 50, 138, { align: 'center' });

    doc.save(`Ayojanix_Pass_${registration.registrationCode}.pdf`);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <Sparkles size={16} color="#06b6d4" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#c7d2fe' }}>
            AYOJANIX OFFICIAL PASS
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{registration.participantName}</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#a5b4fc',
            marginTop: 4,
            letterSpacing: '0.04em',
          }}
        >
          {registration.registrationCode}
        </div>
      </div>

      {/* Ticket Body */}
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
          {event?.name}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 12.5,
            color: 'var(--text-muted)',
            marginBottom: 20,
          }}
        >
          {event?.date && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Calendar size={14} color="#6366f1" />
              <span>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                • {event.startTime}
              </span>
            </div>
          )}
          {event?.venueName && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MapPin size={14} color="#06b6d4" />
              <span>{event.venueName}</span>
            </div>
          )}
        </div>

        {/* QR Code Container */}
        <div
          style={{
            display: 'inline-block',
            padding: 16,
            backgroundColor: '#ffffff',
            borderRadius: 16,
            border: '2px solid #e0e7ff',
            boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.12)',
          }}
        >
          <QRCodeSVG
            value={registration.registrationCode}
            size={180}
            level="H"
            fgColor="#1e1b4b"
            bgColor="#ffffff"
          />
        </div>

        {/* Status Badge */}
        <div style={{ marginTop: 16 }}>
          <span
            className={`badge badge-${
              registration.status === 'ATTENDED' ? 'attended' : 'confirmed'
            }`}
            style={{ fontSize: 11, padding: '4px 14px' }}
          >
            <ShieldCheck size={13} />
            {registration.status} PASS
          </span>
        </div>

        {/* Download Ticket Button */}
        <button
          onClick={downloadPassPDF}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 20, width: '100%', gap: 6 }}
        >
          <Download size={14} />
          <span>Download Badge PDF</span>
        </button>
      </div>

      {/* Perforated ticket notch decor */}
      <div
        style={{
          position: 'absolute',
          top: 98,
          left: -10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-main)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 98,
          right: -10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-main)',
        }}
      />
    </div>
  );
};
