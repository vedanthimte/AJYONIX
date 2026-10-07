import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthService } from '../services/auth.service';
import { RegistrationService } from '../services/registration.service';
import { CertificateService } from '../services/certificate.service';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Shield,
  KeyRound,
  CheckCircle2,
  Calendar,
  Award,
  QrCode,
  Bell,
  Lock,
  Save,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    registrationsCount: 0,
    attendedCount: 0,
    certificatesCount: 0,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setAvatar(user.avatar || '');
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const [regs, certs] = await Promise.all([
        RegistrationService.getMyRegistrations().catch(() => []),
        CertificateService.getMyCertificates().catch(() => []),
      ]);
      const attended = regs.filter((r) => r.status === 'ATTENDED').length;
      setStats({
        registrationsCount: regs.length,
        attendedCount: attended,
        certificatesCount: certs.length,
      });
    } catch {
      // Ignore background stats load error
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await AuthService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });

      updateUser(updated);
      showToast('Profile information updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      await AuthService.changePassword({
        currentPassword,
        newPassword,
      });
      showToast('Password updated successfully! Please keep it secure.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password. Verify your current password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const role = user?.role || 'PARTICIPANT';

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header Banner */}
      <div
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          padding: '36px 32px',
          marginBottom: 28,
          boxShadow: '0 20px 35px -10px rgba(30, 27, 75, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar Circle */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                  {user?.name || 'Ayojanix User'}
                </h1>
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
                  style={{ fontSize: 11, padding: '3px 10px' }}
                >
                  <Shield size={12} />
                  {role} ACCOUNT
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 13,
                  color: '#c7d2fe',
                  marginTop: 6,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="#a5b4fc" />
                  <span>{user?.email}</span>
                </div>
                {user?.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={14} color="#a5b4fc" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#a5b4fc" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick shortcuts */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/my-qr')}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <QrCode size={14} />
              <span>My Passes ({stats.registrationsCount})</span>
            </button>
            <button
              onClick={() => navigate('/certificates')}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Award size={14} />
              <span>Certificates ({stats.certificatesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Profile Settings + Security Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left Column: Personal Information Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Personal Profile Details</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Update your registered campus information and contact parameters
              </p>
            </div>
            <UserIcon size={20} color="#4f46e5" />
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vedant Himte"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only Institutional UID)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                Institutional email IDs cannot be changed directly for credential security.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engg"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ marginTop: 8 }}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Password Management & Account Role Scope */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Change Password Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Change Account Password</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Manage your credentials and secure login token
                </p>
              </div>
              <KeyRound size={20} color="#f59e0b" />
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark"
                disabled={changingPassword}
                style={{ width: '100%', marginTop: 6 }}
              >
                <Lock size={15} />
                <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Role Privileges Card */}
          <div
            className="card"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Shield size={18} color="#4f46e5" />
              <strong style={{ fontSize: 14, color: '#1e293b' }}>
                Account Authority Level: {role}
              </strong>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
              {role === 'ADMIN'
                ? 'Full system oversight, finance management, vendor audits, role assignments, and all event operations.'
                : role === 'ORGANIZER'
                ? 'Create campus events, assign duty rosters, log invoices, and generate participant certificates.'
                : role === 'VOLUNTEER'
                ? 'Scan live QR entry codes at venue gates, log participant check-ins, and view assigned shift stations.'
                : 'Browse campus lineups, register for events, download official digital PDF passes, and verify certificates.'}
            </p>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <button
                onClick={() => navigate('/notifications')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bell size={14} color="#6366f1" />
                  <span>Check Notification Inbox</span>
                </div>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
