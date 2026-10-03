import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '../services/aiAndReport.service';
import { NotificationItem } from '../types';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCheck, QrCode, Award, UserCheck, AlertOctagon, ExternalLink } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const items = await NotificationService.getMyNotifications();
      setNotifications(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      showToast('Failed to mark read', 'error');
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await NotificationService.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
      } catch {
        // Ignore
      }
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'REGISTRATION') return <QrCode size={18} color="#4f46e5" />;
    if (type === 'CERTIFICATE') return <Award size={18} color="#059669" />;
    if (type === 'DUTY') return <UserCheck size={18} color="#d97706" />;
    if (type === 'EMERGENCY') return <AlertOctagon size={18} color="#dc2626" />;
    return <Bell size={18} color="#6366f1" />;
  };

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
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
          <h1 className="page-title">Notification Inbox</h1>
          <p className="page-subtitle">
            System notices, registration confirmations, emergency alerts, and certificate deliveries
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
          <CheckCheck size={15} />
          <span>Mark All Read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Bell size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Inbox Clear</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            You have caught up with all campus alerts and registration notifications.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="card"
              style={{
                padding: '16px 20px',
                cursor: item.link ? 'pointer' : 'default',
                backgroundColor: item.read ? '#ffffff' : '#f0fdf4',
                borderLeft: item.read ? '1px solid var(--border-light)' : '4px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: item.read ? '#f1f5f9' : '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(item.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{item.message}</p>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                {item.link && (
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end', color: '#4f46e5' }}>
                    <ExternalLink size={14} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
