import React, { useState, useEffect } from 'react';
import { AIService } from '../services/aiAndReport.service';
import { useToast } from '../context/ToastContext';
import {
  Sliders,
  Sparkles,
  Building,
  Truck,
  Users2,
  CheckCircle2,
  HelpCircle,
  Star,
  Award,
} from 'lucide-react';

export const AIRecommendations: React.FC = () => {
  const [formData, setFormData] = useState({
    eventType: 'TECHNICAL',
    participants: 500,
    budget: 100000,
  });

  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await AIService.getRecommendations(formData);
      setRecommendation(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#eef2ff', borderRadius: 20, color: '#4f46e5', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          <Sparkles size={14} />
          <span>RESOURCE ALLOCATION MATCHER</span>
        </div>
        <h1 className="page-title">AI Resource & Supplier Recommendations</h1>
        <p className="page-subtitle">
          Intelligent constraint-matching algorithm pairing campus facilities, vendor partners, and volunteer rosters with detailed justification
        </p>
      </div>

      {/* Input Parameters Bar */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          padding: 20,
          marginBottom: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          alignItems: 'flex-end',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Event Domain</label>
          <select
            className="form-select"
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
          >
            <option value="TECHNICAL">Technical Workshop / Hackathon</option>
            <option value="CULTURAL">Cultural Fest / Music Stage</option>
            <option value="SEMINAR">Academic Seminar / Keynote</option>
            <option value="CONFERENCE">National Paper Conference</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Attendee Headcount</label>
          <input
            type="number"
            className="form-input"
            value={formData.participants}
            onChange={(e) => setFormData({ ...formData, participants: Number(e.target.value) })}
            min={20}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Allocated Budget (₹)</label>
          <input
            type="number"
            className="form-input"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            min={5000}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 42 }}>
          <Sliders size={16} />
          <span>{loading ? 'Evaluating...' : 'Re-match Resources'}</span>
        </button>
      </form>

      {/* Recommendations Results */}
      {recommendation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Venue Recommendation */}
          <div className="card" style={{ borderLeft: '5px solid #4f46e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ backgroundColor: '#e0e7ff', padding: 8, borderRadius: 10, color: '#4338ca' }}>
                <Building size={22} />
              </div>
              <div>
                <span className="badge badge-published" style={{ marginBottom: 2 }}>
                  OPTIMAL VENUE MATCH ({recommendation.recommendedVenue?.recommendationScore || '98%'})
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  {recommendation.recommendedVenue?.name || 'Main Campus Auditorium'}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, marginBottom: 12 }}>
              <strong>AI Justification:</strong> {recommendation.recommendedVenue?.reason}
            </p>

            <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: '#64748b' }}>
              <span>Location: {recommendation.recommendedVenue?.location}</span>
              <span>•</span>
              <span>Capacity: {recommendation.recommendedVenue?.capacity} Seats</span>
              <span>•</span>
              <span>Booking: ₹{recommendation.recommendedVenue?.price}</span>
            </div>
          </div>

          {/* Section 2: Volunteer Allocation */}
          <div className="card" style={{ borderLeft: '5px solid #06b6d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ backgroundColor: '#cffafe', padding: 8, borderRadius: 10, color: '#0891b2' }}>
                <Users2 size={22} />
              </div>
              <div>
                <span className="badge badge-ongoing" style={{ marginBottom: 2 }}>
                  RECOMMENDED VOLUNTEER CORPS
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  Deploy {recommendation.volunteerAllocation?.requiredCount} Dedicated Volunteers
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, marginBottom: 16 }}>
              <strong>AI Justification:</strong> For an expected turnout of {formData.participants} students, an optimal volunteer ratio of 1:25 prevents registration bottlenecks and keeps gate check-in duration under 3 seconds per attendee.
            </p>

            <div className="grid-cols-4">
              {recommendation.volunteerAllocation?.suggestedRoster?.map((item: any, i: number) => (
                <div key={i} style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.duty}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
                    {item.count} Staff
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Vendor Recommendations */}
          <div className="card" style={{ borderLeft: '5px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ backgroundColor: '#d1fae5', padding: 8, borderRadius: 10, color: '#059669' }}>
                <Truck size={22} />
              </div>
              <div>
                <span className="badge badge-positive" style={{ marginBottom: 2 }}>
                  PARTNER SUPPLIER SHORTLIST
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  Recommended Vendor Contractors
                </h3>
              </div>
            </div>

            <div className="grid-cols-2">
              {recommendation.recommendedVendors?.map((v: any) => (
                <div
                  key={v.id}
                  style={{
                    padding: 16,
                    backgroundColor: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{v.name}</div>
                    <span className="badge badge-ongoing" style={{ fontSize: 10 }}>{v.category}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>
                    <Star size={13} fill="#f59e0b" />
                    <span>{v.rating} / 5.0 Campus Rating</span>
                  </div>

                  <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                    <strong>Why Recommended:</strong> {v.matchReason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
