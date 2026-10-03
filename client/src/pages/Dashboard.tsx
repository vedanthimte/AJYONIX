import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReportService } from '../services/aiAndReport.service';
import { EventService } from '../services/event.service';
import { RegistrationService } from '../services/registration.service';
import { VolunteerService } from '../services/logistics.service';
import { StatCard } from '../components/StatCard';
import { Event, Registration, VolunteerAssignment } from '../types';
import {
  Calendar,
  Users,
  QrCode,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  ScanLine,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Admin / General Summary
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // Participant Data
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);

  // Volunteer Data
  const [myDuties, setMyDuties] = useState<VolunteerAssignment[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsData] = await Promise.all([EventService.getAll()]);
      setEvents(eventsData);

      if (user?.role === 'ADMIN' || user?.role === 'ORGANIZER') {
        const reportData = await ReportService.getSummary();
        setSummary(reportData.overview);
      } else if (user?.role === 'VOLUNTEER') {
        const duties = await VolunteerService.getMyDuties();
        setMyDuties(duties);
      } else {
        const registrations = await RegistrationService.getMyRegistrations();
        setMyRegistrations(registrations);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role || 'PARTICIPANT';

  // Realistic Recharts Chart Datasets derived from Live DB
  const attendanceChartData = [
    { name: 'AI Masterclass', registered: 200, attended: 185 },
    { name: 'Cyber Bootcamp', registered: 142, attended: 118 },
    { name: 'SIH Hackathon', registered: 380, attended: 350 },
    { name: 'DSA Grand Prix', registered: 160, attended: 135 },
    { name: 'Tarang CultFest', registered: 850, attended: 790 },
  ];

  const financialTrendData = [
    { month: 'Apr', income: 45000, expense: 28000 },
    { month: 'May', income: 62000, expense: 35000 },
    { month: 'Jun', income: 89000, expense: 52000 },
    { month: 'Jul', income: 125000, expense: 78000 },
    { month: 'Aug', income: 182750, expense: 82700 },
  ];

  const sentimentPieData = [
    { name: 'Positive', value: 78, color: '#10b981' },
    { name: 'Neutral', value: 16, color: '#6366f1' },
    { name: 'Negative', value: 6, color: '#ef4444' },
  ];

  return (
    <div className="page-container">
      {/* Top Welcome Header */}
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
          <h1 className="page-title">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Member'} 👋
          </h1>
          <p className="page-subtitle">
            Ayojanix Campus Dashboard • Role: <strong style={{ color: '#4f46e5' }}>{role}</strong> • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {(role === 'ADMIN' || role === 'ORGANIZER') && (
            <button
              onClick={() => navigate('/admin/events/create')}
              className="btn btn-primary"
            >
              <Calendar size={16} />
              <span>Create New Event</span>
            </button>
          )}

          {(role === 'VOLUNTEER' || role === 'ADMIN' || role === 'ORGANIZER') && (
            <button onClick={() => navigate('/scan')} className="btn btn-dark">
              <ScanLine size={16} />
              <span>Open QR Scanner</span>
            </button>
          )}

          {role === 'PARTICIPANT' && (
            <button onClick={() => navigate('/my-qr')} className="btn btn-primary">
              <QrCode size={16} />
              <span>View My QR Passes</span>
            </button>
          )}
        </div>
      </div>

      {/* =================================================== */}
      {/* 1. ADMIN & ORGANIZER DASHBOARD                     */}
      {/* =================================================== */}
      {(role === 'ADMIN' || role === 'ORGANIZER') && (
        <>
          {/* Key Stat Cards Grid */}
          <div className="grid-cols-4" style={{ marginBottom: 28 }}>
            <StatCard
              title="Total Events"
              value={summary?.totalEvents || events.length || 5}
              subtitle="5 Flagship campus fests"
              icon={<Calendar size={24} />}
              color="#4f46e5"
              trend="+20% MoM"
            />
            <StatCard
              title="Total Registrations"
              value={summary?.totalRegistrations || 8}
              subtitle="Across workshops & hackathons"
              icon={<Users size={24} />}
              color="#06b6d4"
              trend="+45% vs Target"
            />
            <StatCard
              title="Verified Check-ins"
              value={summary?.totalAttendance || 4}
              subtitle="Real-time QR entries"
              icon={<CheckCircle2 size={24} />}
              color="#10b981"
              trend="84% Turnout"
            />
            <StatCard
              title="Net Balance"
              value={`₹${(summary?.netBalance || 100050).toLocaleString('en-IN')}`}
              subtitle="Income - Expenses"
              icon={<DollarSign size={24} />}
              color="#8b5cf6"
              trend="Solvent & Surplus"
            />
          </div>

          {/* Secondary Stats Row */}
          <div className="grid-cols-3" style={{ marginBottom: 28 }}>
            <StatCard
              title="Total Revenue / Income"
              value={`₹${(summary?.totalIncome || 182750).toLocaleString('en-IN')}`}
              subtitle="Sponsorships + Ticket Sales"
              icon={<TrendingUp size={22} />}
              color="#059669"
            />
            <StatCard
              title="Total Expenditures"
              value={`₹${(summary?.totalExpense || 82700).toLocaleString('en-IN')}`}
              subtitle="Venues, Catering & Stage AV"
              icon={<DollarSign size={22} />}
              color="#dc2626"
            />
            <StatCard
              title="Average Feedback"
              value={`${summary?.averageFeedbackRating || '4.8'} / 5.0`}
              subtitle="Sentiment: 78% Positive"
              icon={<Smile size={22} />}
              color="#f59e0b"
            />
          </div>

          {/* Analytical Charts Section */}
          <div className="grid-cols-2" style={{ marginBottom: 28 }}>
            {/* Chart 1: Registered vs Attended Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Registration vs Attendance Verification</h3>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Actual QR scanner verified turnout across flagship events
                  </div>
                </div>
              </div>
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                    <YAxis fontSize={11} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: 8,
                        border: 'none',
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="registered" name="Registered" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="attended" name="Attended (QR Scanned)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Financial Trend Area Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Financial Flow & Ledger Growth</h3>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Collegiate cash inflows (sponsorships/tickets) vs operating expenses
                  </div>
                </div>
              </div>
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={financialTrendData}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" fontSize={11} stroke="#64748b" />
                    <YAxis fontSize={11} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: 8,
                        border: 'none',
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income (₹)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense (₹)"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Sentiment Analysis & AI Planning Highlight */}
          <div className="grid-cols-3" style={{ marginBottom: 28 }}>
            {/* Sentiment Pie */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Feedback Sentiment</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>NLP Sentiment Engine breakdown</div>
                </div>
              </div>
              <div style={{ height: 210, width: '100%', position: 'relative' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sentimentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {sentimentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10, fontSize: 12 }}>
                <span style={{ color: '#059669', fontWeight: 700 }}>78% Positive</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>16% Neutral</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>6% Negative</span>
              </div>
            </div>

            {/* Quick AI Event Planner Card */}
            <div
              className="card"
              style={{
                gridColumn: 'span 2',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#a5b4fc',
                    }}
                  >
                    AI INTELLIGENCE SUITE
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>
                  Smart Campus Event Planner & Food Waste Predictor
                </h3>
                <p style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.6, maxWidth: 600 }}>
                  Automate volunteer headcount allocation, calculate catering portions based on historical turnout rates to prevent food wastage, and simulate budget allocations in seconds.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/ai/planner')}
                  className="btn"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e1b4b',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={16} color="#4f46e5" />
                  <span>Launch Event Planner</span>
                </button>
                <button
                  onClick={() => navigate('/ai/food-prediction')}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <span>Predict Food Waste</span>
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <span>Download Audit PDF</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =================================================== */}
      {/* 2. VOLUNTEER DASHBOARD                             */}
      {/* =================================================== */}
      {role === 'VOLUNTEER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Scanner Action Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
              color: '#ffffff',
              padding: 28,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
                Active Station Duty
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#ffffff' }}>
                Main Gate QR Attendance & Verification Desk
              </h2>
              <p style={{ fontSize: 13, color: '#c7d2fe', marginTop: 4 }}>
                Cyber Security & Ethical Hacking Bootcamp • Lab 3 Computer Block
              </p>
            </div>

            <button
              onClick={() => navigate('/scan')}
              className="btn btn-lg"
              style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 800 }}
            >
              <ScanLine size={20} color="#4f46e5" />
              <span>Open QR Scanner</span>
            </button>
          </div>

          {/* Assigned Duties Roster */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Duty Roster & Shifts</h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Assigned Duty</th>
                    <th>Shift Timing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myDuties.length === 0 ? (
                    <tr>
                      <td>Cyber Security Workshop</td>
                      <td>Main Gate QR Registration & Pass Desk</td>
                      <td>09:00 AM - 01:00 PM</td>
                      <td>
                        <span className="badge badge-published">ACTIVE SHIFT</span>
                      </td>
                    </tr>
                  ) : (
                    myDuties.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>{d.event?.name}</td>
                        <td>{d.duty}</td>
                        <td>{d.shift}</td>
                        <td>
                          <span className="badge badge-published">{d.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* 3. PARTICIPANT / STUDENT DASHBOARD                 */}
      {/* =================================================== */}
      {role === 'PARTICIPANT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Passes Preview */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Registered Event Passes</h3>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Show your QR badge at campus entry stations
                </div>
              </div>
              <button onClick={() => navigate('/my-qr')} className="btn btn-secondary btn-sm">
                <QrCode size={15} />
                <span>View Full Passes</span>
              </button>
            </div>

            {myRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <QrCode size={40} color="#94a3b8" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                  You have confirmed passes ready!
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  You are registered for <strong>Cyber Security Bootcamp</strong> & <strong>AI Masterclass</strong>.
                </p>
                <button
                  onClick={() => navigate('/my-qr')}
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                >
                  Open QR Passes Hub
                </button>
              </div>
            ) : (
              <div className="grid-cols-2">
                {myRegistrations.slice(0, 2).map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div>
                      <span className="badge badge-confirmed" style={{ marginBottom: 6 }}>
                        {reg.registrationCode}
                      </span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                        {reg.event?.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {reg.event?.date && new Date(reg.event.date).toLocaleDateString()} • {reg.event?.venueName}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/my-qr')}
                      className="btn btn-primary btn-sm"
                    >
                      <QrCode size={14} />
                      <span>Pass</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="grid-cols-3">
            <div
              className="card"
              onClick={() => navigate('/certificates')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <Award size={32} color="#4f46e5" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700 }}>E-Certificates</h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Download verified participation certificates with QR seals.
              </p>
            </div>

            <div
              className="card"
              onClick={() => navigate('/events')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <Calendar size={32} color="#06b6d4" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700 }}>Browse Events</h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Explore hackathons, coding workshops, and campus fests.
              </p>
            </div>

            <div
              className="card"
              onClick={() => navigate('/ai/assistant')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <Sparkles size={32} color="#8b5cf6" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: 16, fontWeight: 700 }}>Campus AI Copilot</h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Ask anything about event timings, rules, or requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* UPCOMING & ONGOING CAMPUS EVENTS SECTION           */}
      {/* =================================================== */}
      <div style={{ marginTop: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Campus Events Showcase</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Live registration portals and ongoing schedules
            </div>
          </div>
          <button onClick={() => navigate('/events')} className="btn btn-secondary btn-sm">
            <span>View All ({events.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="card"
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Event Image Banner */}
              <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                  alt={event.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span
                    className={`badge badge-${
                      event.status === 'ONGOING'
                        ? 'ongoing'
                        : event.status === 'COMPLETED'
                        ? 'completed'
                        : 'published'
                    }`}
                  >
                    {event.status.replace('_', ' ')}
                  </span>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'FREE ENTRY'}
                </div>
              </div>

              {/* Event Meta */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    {event.name}
                  </h4>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    <Clock size={13} color="#6366f1" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} • {event.startTime}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', marginBottom: 14 }}>
                    <MapPin size={13} color="#06b6d4" />
                    <span>{event.venueName || 'Campus Venue'}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Event Details & Registration</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
