import React, { useState, useEffect } from 'react';
import { AttendanceService } from '../services/attendance.service';
import { EventService } from '../services/event.service';
import { Event } from '../types';
import { StatCard } from '../components/StatCard';
import {
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  Filter,
  CheckCheck,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AttendanceDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await EventService.getAll();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
        loadAttendance(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (eventId: string) => {
    setLoading(true);
    try {
      const res = await AttendanceService.getEventAttendance(eventId);
      setAttendanceData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    loadAttendance(eventId);
  };

  const stats = attendanceData?.stats || {
    totalRegistered: 0,
    totalCheckedIn: 0,
    checkedOut: 0,
    currentlyInside: 0,
    attendancePercentage: 0,
  };

  const chartData = [
    {
      name: attendanceData?.event?.name || 'Selected Event',
      Registered: stats.totalRegistered,
      Attended: stats.totalCheckedIn,
      Inside: stats.currentlyInside,
    },
  ];

  return (
    <div className="page-container">
      {/* Header & Filter */}
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
          <h1 className="page-title">Attendance Analytics & Gate Audit</h1>
          <p className="page-subtitle">
            Real-time participant check-in flow, venue occupancy, and historical audit logs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-select"
            style={{ minWidth: 260 }}
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: 28 }}>
        <StatCard
          title="Total Registered"
          value={stats.totalRegistered}
          subtitle="Issued digital passes"
          icon={<Users size={22} />}
          color="#4f46e5"
        />
        <StatCard
          title="Total Checked In"
          value={stats.totalCheckedIn}
          subtitle="Verified entry logs"
          icon={<CheckCircle2 size={22} />}
          color="#10b981"
        />
        <StatCard
          title="Currently Inside"
          value={stats.currentlyInside}
          subtitle="Live venue occupancy"
          icon={<UserCheck size={22} />}
          color="#06b6d4"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          subtitle="Turnout efficiency"
          icon={<CheckCheck size={22} />}
          color="#8b5cf6"
          trend={`${stats.attendancePercentage}% verified`}
        />
      </div>

      {/* Comparison Chart */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Registered vs Attended Comparison</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Visual verification of digital check-ins against capacity reservations
            </div>
          </div>
        </div>

        <div style={{ height: 260, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
              <YAxis fontSize={12} stroke="#64748b" />
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
              <Bar dataKey="Registered" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Attended" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Inside" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Audit Log Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Live Check-In Timestamp Records</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Individual gate entries and scanning volunteer attribution
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant Name</th>
                <th>Registration Pass</th>
                <th>Department</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Verified By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!attendanceData?.logs || attendanceData.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 10px', color: '#94a3b8' }}>
                    No check-in entries logged yet for this event. Open the QR Scanner to begin admissions.
                  </td>
                </tr>
              ) : (
                attendanceData.logs.map((record: any) => (
                  <tr key={record.id}>
                    <td style={{ fontWeight: 600 }}>{record.registration?.participantName || 'Student'}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>
                        {record.registration?.registrationCode}
                      </span>
                    </td>
                    <td>{record.user?.department || 'General'}</td>
                    <td>{new Date(record.checkInTime).toLocaleTimeString()}</td>
                    <td>
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ color: '#64748b' }}>{record.scannedBy || 'Gate Scanner'}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          record.checkOutTime ? 'draft' : 'published'
                        }`}
                      >
                        {record.checkOutTime ? 'CHECKED OUT' : 'INSIDE VENUE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
