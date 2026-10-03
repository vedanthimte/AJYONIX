import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  ScanLine,
  Building2,
  Truck,
  Users2,
  DollarSign,
  Sparkles,
  Bot,
  UtensilsCrossed,
  Sliders,
  FileText,
  Award,
  Bell,
  CheckCircle,
  LogOut,
  UserCheck,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'PARTICIPANT';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'block',
          }}
        />
      )}

      <aside
        style={{
          width: 260,
          backgroundColor: 'var(--bg-dark)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--bg-dark-border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'translateX(0)' : undefined,
          flexShrink: 0,
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-normal'}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--bg-dark-border)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff' }}>
              AYOJANIX
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', letterSpacing: '0.02em', fontWeight: 600 }}>
              SMART EVENT SYSTEM
            </div>
          </div>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-dark-surface)',
            borderBottom: '1px solid var(--bg-dark-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#4338ca',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
              border: '2px solid #6366f1',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Guest User'}
            </div>
            <span
              className={`badge badge-${
                role === 'ADMIN'
                  ? 'emergency'
                  : role === 'ORGANIZER'
                  ? 'ongoing'
                  : role === 'VOLUNTEER'
                  ? 'important'
                  : 'published'
              }`}
              style={{ fontSize: 9.5, padding: '2px 8px', marginTop: 3 }}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.05em' }}>
            Main Hub
          </div>

          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink to="/events" icon={<Calendar size={18} />} label="Events" />
          <SidebarLink to="/announcements" icon={<Bell size={18} />} label="Announcements" />

          {/* Participant specific */}
          {role === 'PARTICIPANT' && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '12px 12px 6px', letterSpacing: '0.05em' }}>
                My Activities
              </div>
              <SidebarLink to="/my-qr" icon={<QrCode size={18} />} label="My QR Pass" />
              <SidebarLink to="/certificates" icon={<Award size={18} />} label="My Certificates" />
            </>
          )}

          {/* Volunteer specific */}
          {role === 'VOLUNTEER' && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '12px 12px 6px', letterSpacing: '0.05em' }}>
                Volunteer Desk
              </div>
              <SidebarLink to="/scan" icon={<ScanLine size={18} />} label="QR Scanner" />
              <SidebarLink to="/volunteer/duties" icon={<UserCheck size={18} />} label="Assigned Duties" />
              <SidebarLink to="/attendance" icon={<CheckCircle size={18} />} label="Live Attendance" />
            </>
          )}

          {/* Admin / Organizer Operations */}
          {(role === 'ADMIN' || role === 'ORGANIZER') && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '12px 12px 6px', letterSpacing: '0.05em' }}>
                Event Operations
              </div>
              <SidebarLink to="/scan" icon={<ScanLine size={18} />} label="QR Scanner" />
              <SidebarLink to="/attendance" icon={<CheckCircle size={18} />} label="Attendance Hub" />
              <SidebarLink to="/admin/venues" icon={<Building2 size={18} />} label="Campus Venues" />
              <SidebarLink to="/admin/vendors" icon={<Truck size={18} />} label="Partner Vendors" />
              <SidebarLink to="/admin/volunteers" icon={<Users2 size={18} />} label="Volunteers & Roster" />
              <SidebarLink to="/admin/finance" icon={<DollarSign size={18} />} label="Finance & Invoices" />
              <SidebarLink to="/certificates" icon={<Award size={18} />} label="Certificates" />
              <SidebarLink to="/reports" icon={<FileText size={18} />} label="Audits & Reports" />

              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '12px 12px 6px', letterSpacing: '0.05em' }}>
                AI Intelligence
              </div>
              <SidebarLink to="/ai/planner" icon={<Sparkles size={18} />} label="AI Event Planner" highlight />
              <SidebarLink to="/ai/food-prediction" icon={<UtensilsCrossed size={18} />} label="Food Waste Prediction" />
              <SidebarLink to="/ai/recommendations" icon={<Sliders size={18} />} label="AI Recommendations" />
            </>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '12px 12px 6px', letterSpacing: '0.05em' }}>
            Copilot & Tools
          </div>
          <SidebarLink to="/ai/assistant" icon={<Bot size={18} />} label="Ayojanix AI Copilot" highlight />
          <SidebarLink to="/verify/demo" icon={<CheckCircle size={18} />} label="Verify Certificate" />
        </div>

        {/* Footer Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bg-dark-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: 'transparent',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#450a0a')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; highlight?: boolean }> = ({
  to,
  icon,
  label,
  highlight,
}) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 14px',
        borderRadius: 'var(--radius-md)',
        fontSize: 13.5,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? '#ffffff' : highlight ? '#a5b4fc' : '#94a3b8',
        backgroundColor: isActive
          ? 'rgba(79, 70, 229, 0.4)'
          : highlight
          ? 'rgba(99, 102, 241, 0.08)'
          : 'transparent',
        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
        transition: 'all 0.15s ease',
      })}
    >
      <span style={{ color: highlight ? '#818cf8' : 'inherit' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {highlight && (
        <span
          style={{
            fontSize: 9,
            padding: '2px 5px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          AI
        </span>
      )}
    </NavLink>
  );
};
