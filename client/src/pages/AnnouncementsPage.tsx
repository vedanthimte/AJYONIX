import React, { useState, useEffect } from 'react';
import { AnnouncementService } from '../services/announcement.service';
import { EventService } from '../services/event.service';
import { Announcement, Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Bell, AlertOctagon, AlertTriangle, Plus, Calendar, Clock, Megaphone } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    eventId: '',
  });

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, eventData] = await Promise.all([
        AnnouncementService.getAll(),
        EventService.getAll(),
      ]);
      setAnnouncements(annData);
      setEvents(eventData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AnnouncementService.create(form as any);
      showToast('Announcement broadcasted to participants!', 'success');
      setIsModalOpen(false);
      setForm({ title: '', message: '', priority: 'NORMAL', eventId: '' });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish announcement', 'error');
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
          <h1 className="page-title">Campus Announcements & Alerts</h1>
          <p className="page-subtitle">
            Critical schedules, Wi-Fi keys, room reassignments, and campus emergency broadcasts
          </p>
        </div>

        {isManager && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Megaphone size={16} />
            <span>Broadcast Notice</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {announcements.map((item) => {
          const isEmergency = item.priority === 'EMERGENCY';
          const isImportant = item.priority === 'IMPORTANT';

          return (
            <div
              key={item.id}
              className="card"
              style={{
                backgroundColor: isEmergency ? '#fef2f2' : isImportant ? '#fffbeb' : '#ffffff',
                borderLeft: `5px solid ${isEmergency ? '#ef4444' : isImportant ? '#f59e0b' : '#6366f1'}`,
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {isEmergency ? (
                    <div style={{ backgroundColor: '#fee2e2', borderRadius: '50%', padding: 6 }}>
                      <AlertOctagon size={22} color="#dc2626" />
                    </div>
                  ) : isImportant ? (
                    <div style={{ backgroundColor: '#fef3c7', borderRadius: '50%', padding: 6 }}>
                      <AlertTriangle size={20} color="#d97706" />
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#e0e7ff', borderRadius: '50%', padding: 6 }}>
                      <Bell size={20} color="#4f46e5" />
                    </div>
                  )}

                  <div>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: isEmergency ? '#991b1b' : isImportant ? '#92400e' : 'var(--text-main)',
                      }}
                    >
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span>Posted by {item.createdBy?.name || 'Campus Admin'}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.event && (
                        <>
                          <span>•</span>
                          <strong style={{ color: '#4f46e5' }}>{item.event.name}</strong>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge badge-${
                    isEmergency ? 'emergency' : isImportant ? 'important' : 'published'
                  }`}
                >
                  {item.priority} NOTICE
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isEmergency ? '#7f1d1d' : '#334155',
                  paddingLeft: 46,
                  whiteSpace: 'pre-line',
                }}
              >
                {item.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Broadcast Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Campus Notice or Alert"
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Alert Priority Level</label>
            <select
              className="form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="NORMAL">NORMAL (Standard Announcement)</option>
              <option value="IMPORTANT">IMPORTANT (Highlighted Badge)</option>
              <option value="EMERGENCY">🚨 EMERGENCY ALERT (Global Top Banner)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title / Headline</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Schedule Shift or Evacuation Notice"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 100 }}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Provide clear, actionable details for participants and staff..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Event (Optional - Leave blank for campus-wide)</label>
            <select
              className="form-select"
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
            >
              <option value="">Campus-Wide (All Events)</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              backgroundColor: form.priority === 'EMERGENCY' ? '#dc2626' : undefined,
            }}
          >
            {form.priority === 'EMERGENCY' ? '🚨 Broadcast Emergency Alert' : 'Publish Announcement'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
