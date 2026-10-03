import React, { useState, useEffect } from 'react';
import { AnnouncementService } from '../services/announcement.service';
import { Announcement } from '../types';
import { AlertOctagon, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [emergency, setEmergency] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const announcements = await AnnouncementService.getAll({ priority: 'EMERGENCY' });
        if (announcements.length > 0) {
          setEmergency(announcements[0]);
        }
      } catch {
        // Silent fallback
      }
    };

    fetchEmergency();
  }, []);

  if (!emergency || dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: '#ef4444',
        color: '#ffffff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
        zIndex: 60,
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: '90%' }}>
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertOctagon size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {emergency.title}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.95 }}>
            {emergency.message}
          </div>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: 6,
          opacity: 0.85,
        }}
        aria-label="Dismiss Emergency Alert"
      >
        <X size={18} />
      </button>
    </div>
  );
};
