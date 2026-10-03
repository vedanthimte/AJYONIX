import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CertificateService } from '../services/certificate.service';
import { RegistrationService } from '../services/registration.service';
import { EventService } from '../services/event.service';
import { Certificate, Event, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Award, Download, CheckCircle, ExternalLink, Plus, Search, ShieldCheck } from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState('');

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [certData, eventData] = await Promise.all([
        CertificateService.getMyCertificates(),
        EventService.getAll(),
      ]);
      setCertificates(certData);
      setEvents(eventData);

      // Fetch registrations for generator dropdown
      if (user?.role === 'ADMIN' || user?.role === 'ORGANIZER') {
        const completedEvent = eventData.find((e) => e.status === 'COMPLETED');
        if (completedEvent) {
          const regs = await RegistrationService.getEventRegistrations(completedEvent.id);
          setRegistrations(regs);
          if (regs.length > 0) setSelectedRegId(regs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId) return;

    try {
      const cert = await CertificateService.generate(selectedRegId);
      showToast('Certificate generated successfully!', 'success');
      setIsGenerateModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to issue certificate', 'error');
    }
  };

  const isManager = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 className="page-title">Verified E-Certificates of Participation</h1>
          <p className="page-subtitle">
            Cryptographically sealed and QR-verifiable credentials issued by the institution
          </p>
        </div>

        {isManager && (
          <button onClick={() => setIsGenerateModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Issue Certificate</span>
          </button>
        )}
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
          <Award size={52} color="#94a3b8" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No Certificates Issued Yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Certificates are issued automatically to verified attendees after event valediction.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="card"
              style={{
                border: '2px solid #e0e7ff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="badge badge-published" style={{ marginBottom: 2 }}>
                      {cert.status} CREDENTIAL
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>
                      {cert.eventName}
                    </h3>
                  </div>
                </div>

                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
                  {cert.certificateCode}
                </span>
              </div>

              <div style={{ fontSize: 13.5, color: '#334155', marginBottom: 16 }}>
                Awarded proudly to <strong>{cert.participantName}</strong> for verified collegiate attendance.
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} • PRMITR Campus Core
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={`/api/certificates/${cert.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} />
                  <span>Download Official PDF</span>
                </a>

                <button
                  onClick={() => navigate(`/verify/${cert.certificateCode}`)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <ShieldCheck size={14} color="#059669" />
                  <span>Public Verification</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Certificate Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Issue Verified Participant Certificate"
      >
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Select Verified Attendee Registration</label>
            <select
              className="form-select"
              value={selectedRegId}
              onChange={(e) => setSelectedRegId(e.target.value)}
            >
              {registrations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.participantName} ({r.registrationCode}) — {r.participantEmail}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              padding: 14,
              backgroundColor: '#ecfdf5',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #a7f3d0',
              fontSize: 12.5,
              color: '#065f46',
              marginBottom: 20,
            }}
          >
            Generating this certificate assigns a unique cryptographically traceable code (e.g. <code>CERT-AYX-2026-XXXXX</code>) and enables public verification.
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Issue Certificate of Participation
          </button>
        </form>
      </Modal>
    </div>
  );
};
