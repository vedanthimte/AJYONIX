import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, Shield, UserCheck, CalendarCheck, GraduationCap, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    try {
      await login(quickEmail, quickPass);
      showToast(`Logged in as ${quickEmail.split('@')[0].toUpperCase()}`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '36px 32px',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
              marginBottom: 12,
            }}
          >
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            AYOJANIX
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            A Smart Event Management System • PRMITR
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@ayojanix.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            ⚡ Fast Demo One-Click Logins
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@ayojanix.demo', 'Admin@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: 12 }}
              disabled={loading}
            >
              <Shield size={14} color="#dc2626" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('organizer@ayojanix.demo', 'Organizer@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: 12 }}
              disabled={loading}
            >
              <CalendarCheck size={14} color="#4f46e5" />
              <span>Organizer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('volunteer@ayojanix.demo', 'Volunteer@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: 12 }}
              disabled={loading}
            >
              <UserCheck size={14} color="#d97706" />
              <span>Volunteer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('participant@ayojanix.demo', 'Participant@123')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: 12 }}
              disabled={loading}
            >
              <GraduationCap size={14} color="#059669" />
              <span>Participant</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
};
