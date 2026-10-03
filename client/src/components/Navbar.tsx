import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../services/aiAndReport.service';
import { NotificationItem } from '../types';
import { Menu, Bell, Bot, Search, ExternalLink, Check, Sparkles } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const items = await NotificationService.getMyNotifications();
      setNotifications(items);
      setUnreadCount(items.filter((n: NotificationItem) => !n.read).length);
    } catch {
      // Ignore background notification fetch errors
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      style={{
        height: 68,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Campus Node:</span>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            PRMITR Badnera (CSE)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Quick AI Assistant Button */}
        <button
          onClick={() => navigate('/ai/assistant')}
          className="btn btn-sm"
          style={{
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            border: '1px solid #c7d2fe',
            fontWeight: 700,
          }}
        >
          <Sparkles size={15} color="#4f46e5" />
          <span>Ask Ayojanix AI</span>
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 320,
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                        cursor: n.link ? 'pointer' : 'default',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 12px 4px 6px',
            backgroundColor: '#f8fafc',
            borderRadius: 30,
            border: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name ? user.name.split(' ')[0] : 'User'}
          </div>
        </div>
      </div>
    </header>
  );
};
