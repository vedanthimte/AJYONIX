import React, { useState } from 'react';
import { AIService } from '../services/aiAndReport.service';
import { useToast } from '../context/ToastContext';
import {
  UtensilsCrossed,
  Sparkles,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Info,
} from 'lucide-react';

export const AIFoodPrediction: React.FC = () => {
  const [formData, setFormData] = useState({
    registeredParticipants: 500,
    historicalAttendancePercentage: 82,
    eventType: 'HACKATHON',
    numberOfMeals: 1,
  });

  const [prediction, setPrediction] = useState<any>({
    registeredParticipants: 500,
    historicalAttendanceRate: '82%',
    predictedAttendance: 410,
    recommendedMeals: 425,
    baselineOrderWithoutAI: 500,
    expectedFoodSavedMeals: 90,
    estimatedWastePercentage: '18%',
    potentialCostSavedINR: 16200,
    actionableGuidance: [
      'Order precisely 425 meals instead of 500 meals to avoid 90 unconsumed food boxes.',
      'Direct 10:30 AM QR scanner headcount to the kitchen manager for live final plating adjustments.',
      'Pre-register food preferences (Veg/Non-Veg) to prevent category-specific shortages.',
      'Designate clean food cold storage before the event begins.',
    ],
    dietaryBreakdown: {
      vegetarian: 298,
      nonVegetarian: 127,
    },
  });

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AIService.predictFoodWaste(formData);
      setPrediction(res);
      showToast('Food waste mitigation projection updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to predict food waste', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', backgroundColor: '#ecfdf5', borderRadius: 20, color: '#059669', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
          <Leaf size={14} />
          <span>SUSTAINABLE CAMPUS INITIATIVE</span>
        </div>
        <h1 className="page-title">AI Food Waste & Catering Predictor</h1>
        <p className="page-subtitle">
          Eliminate surplus event catering and cut student council catering expenditures using predictive turnout models
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 28, alignItems: 'start' }}>
        {/* Form Card */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Catering Headcount Parameters</h3>

          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label className="form-label">Registered Participants</label>
              <input
                type="number"
                className="form-input"
                value={formData.registeredParticipants}
                onChange={(e) => setFormData({ ...formData, registeredParticipants: Number(e.target.value) })}
                min={10}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Historical Attendance Benchmark (%)</label>
              <input
                type="number"
                className="form-input"
                value={formData.historicalAttendancePercentage}
                onChange={(e) => setFormData({ ...formData, historicalAttendancePercentage: Number(e.target.value) })}
                min={30}
                max={100}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Format</label>
              <select
                className="form-select"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              >
                <option value="HACKATHON">Hackathon (Multiple Boxed Meals)</option>
                <option value="WORKSHOP">Technical Workshop (Buffet Lunch)</option>
                <option value="SEMINAR">Seminar (High-Tea & Snacks)</option>
                <option value="CULTURAL">Cultural Fest (Open Food Courts)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Meal Servings</label>
              <input
                type="number"
                className="form-input"
                value={formData.numberOfMeals}
                onChange={(e) => setFormData({ ...formData, numberOfMeals: Number(e.target.value) })}
                min={1}
                max={5}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              <UtensilsCrossed size={16} />
              <span>{loading ? 'Calculating...' : 'Run Waste Projection Model'}</span>
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: 12,
              color: '#64748b',
              display: 'flex',
              gap: 8,
            }}
          >
            <Info size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Note:</strong> Labeled as an MVP statistical predictive engine combining live check-in telemetry with campus attendance averages.
            </div>
          </div>
        </div>

        {/* Output Projection Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {prediction && (
            <>
              {/* Top Savings Banner */}
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      PROJECTED COST & WASTE REDUCTION
                    </span>
                    <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#ffffff' }}>
                      ₹{prediction.potentialCostSavedINR.toLocaleString('en-IN')} Saved
                    </h2>
                    <p style={{ fontSize: 13, color: '#d1fae5', marginTop: 2 }}>
                      Preventing {prediction.expectedFoodSavedMeals} surplus unconsumed meals from being trashed
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      padding: '12px 20px',
                      borderRadius: 14,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{prediction.estimatedWastePercentage}</div>
                    <div style={{ fontSize: 11, color: '#a7f3d0' }}>Waste Deficit Saved</div>
                  </div>
                </div>
              </div>

              {/* Comparison Stats */}
              <div className="grid-cols-3">
                <div className="card" style={{ textAlign: 'center', padding: 18 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registered Turnout</span>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: 'var(--text-main)' }}>
                    {prediction.registeredParticipants}
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Benchmark: {prediction.historicalAttendanceRate}</span>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 18, border: '2px solid #6ee7b7' }}>
                  <span style={{ fontSize: 12, color: '#065f46', fontWeight: 700 }}>AI Predicted Turnout</span>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#059669' }}>
                    {prediction.predictedAttendance}
                  </div>
                  <span style={{ fontSize: 11, color: '#059669' }}>Actual arrivals</span>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 18, backgroundColor: '#eef2ff' }}>
                  <span style={{ fontSize: 12, color: '#4338ca', fontWeight: 700 }}>Recommended Order</span>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: '#4f46e5' }}>
                    {prediction.recommendedMeals} Meals
                  </div>
                  <span style={{ fontSize: 11, color: '#4f46e5' }}>+4% safety buffer</span>
                </div>
              </div>

              {/* Dietary Split */}
              <div className="card">
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recommended Plating Proportions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ padding: 14, backgroundColor: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>Pure Vegetarian / Jain (70%)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
                      {prediction.dietaryBreakdown?.vegetarian || 298} Plates
                    </div>
                  </div>

                  <div style={{ padding: 14, backgroundColor: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: 12, color: '#9a3412', fontWeight: 700 }}>Non-Vegetarian (30%)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#c2410c', marginTop: 4 }}>
                      {prediction.dietaryBreakdown?.nonVegetarian || 127} Plates
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Guidance */}
              <div className="card">
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                  Actionable Campus Logistics Protocols
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {prediction.actionableGuidance.map((tip: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: '#334155' }}>{tip}</span>
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
