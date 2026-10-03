import React, { useState, useEffect } from 'react';
import { EventService } from '../services/event.service';
import { ReportService } from '../services/aiAndReport.service';
import { Event } from '../types';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Download,
  CheckCircle,
  DollarSign,
  Users,
  Eye,
  Award,
  Calendar,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsList, summary] = await Promise.all([
        EventService.getAll(),
        ReportService.getSummary(),
      ]);

      setEvents(eventsList);
      setSummaryData(summary.overview);

      if (eventsList.length > 0) {
        setSelectedEventId(eventsList[0].id);
        const report = await ReportService.getEventReport(eventsList[0].id);
        setReportData(report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = async (id: string) => {
    setSelectedEventId(id);
    setLoading(true);
    try {
      const report = await ReportService.getEventReport(id);
      setReportData(report);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch event report', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="page-title">Campus Event Audits & Official Reports</h1>
          <p className="page-subtitle">
            Generate and download institutional audit PDFs for Dean review, NAAC accreditation, and finance committees
          </p>
        </div>

        {selectedEventId && (
          <a
            href={`/api/reports/download/${selectedEventId}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <Download size={16} />
            <span>Download Audit PDF</span>
          </a>
        )}
      </div>

      {/* Campus Milestone Summary Bar */}
      {summaryData && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            border: 'none',
            padding: 24,
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 6 }}>
            Accreditation & Event Cell Summary
          </div>
          <div className="grid-cols-4" style={{ marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: '#c7d2fe' }}>Campus Events Logged</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{summaryData.totalEvents}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#c7d2fe' }}>Total Confirmed Attendees</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{summaryData.totalRegistrations}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#c7d2fe' }}>Total Funds Managed</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>₹{summaryData.totalIncome.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#c7d2fe' }}>Satisfaction Rating</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{summaryData.averageFeedbackRating} / 5.0</div>
            </div>
          </div>
        </div>
      )}

      {/* Select Event Tab Bar */}
      <div style={{ marginBottom: 20 }}>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
          Select Event to Audit
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => handleSelectEvent(e.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedEventId === e.id ? '#4f46e5' : '#ffffff',
                color: selectedEventId === e.id ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
              }}
            >
              <span>{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audit Detail Content */}
      {reportData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Attendance Audit */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              1. Participation & Verified Attendance Metrics
            </h3>

            <div className="grid-cols-4">
              <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Registrations</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#1e293b' }}>
                  {reportData.analytics.registered}
                </div>
              </div>
              <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Verified Check-ins</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#059669' }}>
                  {reportData.analytics.attended}
                </div>
              </div>
              <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Turnout Percentage</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#4f46e5' }}>
                  {reportData.analytics.attendanceRate}
                </div>
              </div>
              <div style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Certificates Issued</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#8b5cf6' }}>
                  {reportData.analytics.certificatesIssued}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Audit */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              2. Financial Performance & Surplus Reconciliation
            </h3>

            <div className="grid-cols-3">
              <div style={{ padding: 14, backgroundColor: '#ecfdf5', borderRadius: 10, border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: 12, color: '#065f46' }}>Gross Inflow / Revenue</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#047857' }}>
                  ₹{reportData.analytics.revenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: 14, backgroundColor: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <span style={{ fontSize: 12, color: '#991b1b' }}>Operating Expenditures</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#b91c1c' }}>
                  ₹{reportData.analytics.cost.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: 14, backgroundColor: '#eef2ff', borderRadius: 10, border: '1px solid #c7d2fe' }}>
                <span style={{ fontSize: 12, color: '#3730a3' }}>Net Event Surplus</span>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#4338ca' }}>
                  ₹{reportData.analytics.net.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Volunteers Deployed */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              3. Operational Staffing ({reportData.event.volunteerAssignments?.length || 0} Volunteers)
            </h3>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Station Duty</th>
                    <th>Shift</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!reportData.event.volunteerAssignments || reportData.event.volunteerAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: '#94a3b8', textAlign: 'center' }}>
                        No specific volunteer assignments logged for this event.
                      </td>
                    </tr>
                  ) : (
                    reportData.event.volunteerAssignments.map((v: any) => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>{v.volunteer?.name}</td>
                        <td>{v.duty}</td>
                        <td>{v.shift}</td>
                        <td>
                          <span className="badge badge-published">{v.status}</span>
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
    </div>
  );
};
