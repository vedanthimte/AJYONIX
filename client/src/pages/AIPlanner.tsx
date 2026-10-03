import React, { useState } from 'react';
import { AIService } from '../services/aiAndReport.service';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Users,
  Building,
  Utensils,
  DollarSign,
  CheckSquare,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

export const AIPlanner: React.FC = () => {
  const [formData, setFormData] = useState({
    eventType: 'HACKATHON',
    expectedParticipants: 500,
    durationHours: 24,
    budget: 150000,
    venueRequirements: 'High-speed gigabit LAN and dual power backup',
  });

  const [planResult, setPlanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AIService.planEvent(formData);
      setPlanResult(res);
      showToast('AI Event Plan formulated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#eef2ff', borderRadius: 20, color: '#4f46e5', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          <Sparkles size={14} />
          <span>AYOJANIX AI COPILOT</span>
        </div>
        <h1 className="page-title">AI Collegiate Event Planning Engine</h1>
        <p className="page-subtitle">
          Predict staffing rosters, prevent catering waste, and generate chronological checklists tailored for university scale
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 28, alignItems: 'start' }}>
        {/* Input Parameters Card */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 18 }}>Event Scope & Parameters</h3>

          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select
                className="form-select"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="HACKATHON">Campus Hackathon (36h)</option>
                <option value="WORKSHOP">Hands-on Technical Workshop</option>
                <option value="SEMINAR">Expert Keynote & Seminar</option>
                <option value="CONFERENCE">National Conference</option>
                <option value="CULTURAL">Annual Cultural Extravaganza</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expected Participant Registrations</label>
              <input
                type="number"
                className="form-input"
                value={formData.expectedParticipants}
                onChange={(e) => setFormData({ ...formData, expectedParticipants: Number(e.target.value) })}
                min={20}
                max={5000}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Duration (Hours)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                  min={1}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Budget (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  min={5000}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Specific Facility / Venue Criteria</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 70 }}
                value={formData.venueRequirements}
                onChange={(e) => setFormData({ ...formData, venueRequirements: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? 'Synthesizing Architecture...' : 'Generate AI Event Plan'}</span>
            </button>
          </form>
        </div>

        {/* Generated Plan Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!planResult ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Sparkles size={48} color="#818cf8" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Awaiting Parameters</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, maxWidth: 400, margin: '6px auto 0' }}>
                Fill in the event parameters on the left and submit to view AI-generated volunteer allocations, catering forecasts, and suggested schedules.
              </p>
            </div>
          ) : (
            <>
              {/* Quick AI Metrics Grid */}
              <div className="grid-cols-4">
                <div className="card" style={{ padding: 18, borderTop: '3px solid #4f46e5' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Predicted Turnout</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                    {planResult.overview.predictedAttendance}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>from {planResult.overview.expectedParticipants} registered</div>
                </div>

                <div className="card" style={{ padding: 18, borderTop: '3px solid #06b6d4' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Volunteers Needed</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                    {planResult.recommendations.volunteers}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>1 per 25 attendees</div>
                </div>

                <div className="card" style={{ padding: 18, borderTop: '3px solid #10b981' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Food Estimate</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                    {planResult.recommendations.estimatedMeals}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Includes 5% safety buffer</div>
                </div>

                <div className="card" style={{ padding: 18, borderTop: '3px solid #8b5cf6' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Gate QR Desks</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                    {planResult.recommendations.registrationDesks}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>For zero queue lag</div>
                </div>
              </div>

              {/* Recommended Venue */}
              <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building size={20} color="#4f46e5" />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
                      Recommended Campus Venue
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      {planResult.recommendations.venue}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="card">
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                  Estimated Budget Allocation (₹{planResult.overview.totalBudget.toLocaleString('en-IN')})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {planResult.budgetBreakdown.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4f46e5' }} />
                        <span style={{ fontWeight: 600 }}>{item.category}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>({item.percentage}%)</span>
                      </div>
                      <strong style={{ color: '#1e293b' }}>₹{item.amount.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Schedule */}
              <div className="card">
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Suggested Event Itinerary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {planResult.suggestedSchedule.map((slot: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                      <span style={{ fontWeight: 700, color: '#4f46e5', minWidth: 160 }}>{slot.time}</span>
                      <span style={{ color: '#334155' }}>{slot.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="card">
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Milestone Action Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {planResult.checklist.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, fontSize: 13, alignItems: 'flex-start' }}>
                      <CheckSquare size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong>{item.phase}:</strong> <span style={{ color: '#475569' }}>{item.task}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
