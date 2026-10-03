import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationService } from '../services/registration.service';
import { Registration } from '../types';
import { QRPassCard } from '../components/QRPassCard';
import { QrCode, Calendar, ArrowRight, ShieldCheck, Download } from 'lucide-react';

export const MyQR: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const data = await RegistrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ color: '#64748b' }}>Generating secure digital QR passes...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Digital Entry Passes & QR Codes</h1>
        <p className="page-subtitle">
          Present your dynamic QR pass at the campus venue checkpoint to verify attendance
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
          <QrCode size={52} color="#94a3b8" style={{ marginBottom: 14 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No Active Event Passes</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
            You haven't registered for any upcoming college events yet. Browse our active lineup to secure your pass.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="btn btn-primary"
            style={{ marginTop: 20 }}
          >
            <Calendar size={16} />
            <span>Browse Campus Events</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Multiple Passes Selector Tabs */}
          {registrations.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                backgroundColor: '#e2e8f0',
                padding: 4,
                borderRadius: 'var(--radius-lg)',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {registrations.map((reg, idx) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedIndex(idx)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: selectedIndex === idx ? '#ffffff' : 'transparent',
                    color: selectedIndex === idx ? '#1e1b4b' : '#64748b',
                    boxShadow: selectedIndex === idx ? 'var(--shadow-sm)' : 'none',
                    fontWeight: 700,
                  }}
                >
                  <span>{reg.event?.name ? reg.event.name.split(' ')[0] : 'Pass'}</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>({reg.registrationCode})</span>
                </button>
              ))}
            </div>
          )}

          {/* Active QR Pass Card Component */}
          {registrations[selectedIndex] && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <QRPassCard registration={registrations[selectedIndex]} />
            </div>
          )}

          {/* Instructions Box */}
          <div
            className="card"
            style={{
              maxWidth: 480,
              backgroundColor: '#f8fafc',
              border: '1px dashed var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
              <ShieldCheck size={18} color="#4f46e5" />
              <strong style={{ fontSize: 13, color: '#1e293b' }}>Fast Verification Station Protocol</strong>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
              Keep your screen brightness high when arriving at the entry checkpoint. Volunteers will scan this QR pass to record your check-in and issue your welcome kit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
