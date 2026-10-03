import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../services/event.service';
import { RegistrationService } from '../services/registration.service';
import { FeedbackService } from '../services/feedback.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Event, Feedback, EventStatus } from '../types';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Share2,
  Edit,
  ScanLine,
  Send,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<any>(null);

  // Feedback & Sentiment state
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<any>(null);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadEventDetails();
      loadEventFeedback();
      checkUserRegistration();
    }
  }, [id, user]);

  const loadEventDetails = async () => {
    try {
      const data = await EventService.getById(id!);
      setEvent(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEventFeedback = async () => {
    try {
      const res = await FeedbackService.getEventFeedback(id!);
      setFeedbackList(res.feedbacks || []);
      setFeedbackSummary(res.sentimentSummary || null);
    } catch {
      // Ignore
    }
  };

  const checkUserRegistration = async () => {
    if (!user) return;
    try {
      const myRegs = await RegistrationService.getMyRegistrations();
      const match = myRegs.find((r) => r.eventId === id);
      if (match) {
        setIsRegistered(true);
        setUserRegistration(match);
      }
    } catch {
      // Ignore
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const reg = await RegistrationService.register(id!);
      setIsRegistered(true);
      setUserRegistration(reg);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`Registration confirmed! Your Pass: ${reg.registrationCode}`, 'success');
      loadEventDetails();
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) {
      showToast('Please enter a feedback comment', 'warning');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await FeedbackService.submit(id!, {
        rating: userRating,
        comment: userComment,
        registrationCode: userRegistration?.registrationCode,
      });

      showToast('Thank you! Your feedback and sentiment was analyzed and recorded.', 'success');
      setUserComment('');
      loadEventFeedback();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await EventService.updateStatus(id!, newStatus);
      showToast(`Event status updated to ${newStatus}`, 'success');
      loadEventDetails();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ color: '#64748b' }}>Loading event specifics...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Event Not Found</h2>
        <button onClick={() => navigate('/events')} className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Events List
        </button>
      </div>
    );
  }

  const isManager = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';
  const registeredCount = event._count?.registrations || 0;
  const isFull = registeredCount >= event.capacity;

  return (
    <div className="page-container">
      {/* Hero Header with Glassmorphism */}
      <div
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          marginBottom: 32,
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ height: 260, width: '100%', position: 'relative' }}>
          <img
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
            alt={event.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0f172a 0%, transparent 80%)',
            }}
          />
        </div>

        <div style={{ padding: '0 36px 36px', marginTop: -80, position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              className={`badge badge-${
                event.status === 'ONGOING'
                  ? 'ongoing'
                  : event.status === 'COMPLETED'
                  ? 'completed'
                  : event.status === 'REGISTRATION_OPEN'
                  ? 'published'
                  : 'draft'
              }`}
            >
              {event.status.replace('_', ' ')}
            </span>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {event.type}
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', maxWidth: 800, color: '#ffffff' }}>
            {event.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
              marginTop: 18,
              fontSize: 13.5,
              color: '#cbd5e1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="#818cf8" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#38bdf8" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color="#4ade80" />
              <span>{event.venueName || 'Campus Main Auditorium'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="#fbbf24" />
              <span>{registeredCount} / {event.capacity} Registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Left, Action Sidebar Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Overview */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>About This Event</h3>
            <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {event.description}
            </p>

            {event.organizer && (
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                    Organized by {event.organizer.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {event.organizer.email}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Sentiment Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Participant Feedback & Sentiment</h3>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  NLP Sentiment classification of attendee experience
                </div>
              </div>

              {feedbackSummary && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-positive">
                    <Smile size={12} /> {feedbackSummary.positivePercentage}% Pos
                  </span>
                  <span className="badge badge-neutral">
                    <Meh size={12} /> {feedbackSummary.neutralPercentage}% Neu
                  </span>
                  <span className="badge badge-negative">
                    <Frown size={12} /> {feedbackSummary.negativePercentage}% Neg
                  </span>
                </div>
              )}
            </div>

            {/* Leave Feedback Form */}
            {isRegistered ? (
              <form
                onSubmit={handleFeedbackSubmit}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 24,
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
                  Share Your Experience
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 2,
                        color: star <= userRating ? '#f59e0b' : '#cbd5e1',
                      }}
                    >
                      <Star size={20} fill={star <= userRating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginLeft: 6 }}>
                    {userRating} / 5 Stars
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <textarea
                    className="form-textarea"
                    placeholder="What did you learn? How was the venue and speaker coordination?"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingFeedback}
                >
                  <Send size={14} />
                  <span>{submittingFeedback ? 'Analyzing Sentiment...' : 'Submit Feedback'}</span>
                </button>
              </form>
            ) : (
              <div
                style={{
                  padding: 16,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  color: '#475569',
                  marginBottom: 20,
                }}
              >
                Register for this event to leave feedback and participate in the AI sentiment analysis.
              </div>
            )}

            {/* Feedback List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {feedbackList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                  No feedback recorded yet. Be the first to review!
                </div>
              ) : (
                feedbackList.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                          {f.user?.name || 'Verified Attendee'}
                        </span>
                        <div style={{ display: 'flex', color: '#f59e0b' }}>
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <Star key={i} size={13} fill="#f59e0b" />
                          ))}
                        </div>
                      </div>

                      <span
                        className={`badge badge-${
                          f.sentiment === 'POSITIVE'
                            ? 'positive'
                            : f.sentiment === 'NEGATIVE'
                            ? 'negative'
                            : 'neutral'
                        }`}
                        style={{ fontSize: 10 }}
                      >
                        {f.sentiment} (Score: {f.sentimentScore > 0 ? `+${f.sentimentScore}` : f.sentimentScore})
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      "{f.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Registration Action & Organizer Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Registration Card */}
          <div className="card" style={{ borderTop: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ticket Price</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>
                {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}
              </div>
            </div>

            {isRegistered ? (
              <div>
                <div
                  style={{
                    padding: 14,
                    backgroundColor: '#ecfdf5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <div>
                    <strong>Registration Confirmed!</strong>
                    <div>Pass: {userRegistration?.registrationCode}</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/my-qr')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <QrCode size={16} />
                  <span>Open My QR Pass</span>
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleRegister}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: 12 }}
                  disabled={registering || isFull || event.status === 'COMPLETED' || event.status === 'CANCELLED'}
                >
                  <QrCode size={18} />
                  <span>
                    {registering
                      ? 'Confirming Registration...'
                      : isFull
                      ? 'Capacity Full'
                      : event.status === 'COMPLETED'
                      ? 'Event Concluded'
                      : 'Register & Generate QR Pass'}
                  </span>
                </button>
                <div style={{ fontSize: 11.5, color: '#64748b', textAlign: 'center' }}>
                  Instant digital QR pass generated upon confirmation
                </div>
              </div>
            )}
          </div>

          {/* Organizer Operations Management Card */}
          {isManager && (
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                ⚡ Organizer Operations Panel
              </h4>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Event Status</label>
                <select
                  className="form-select"
                  value={event.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                  <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                  <option value="ONGOING">ONGOING (Today)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => navigate('/scan')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <ScanLine size={14} color="#4f46e5" />
                  <span>Open QR Gate Scanner</span>
                </button>

                <button
                  onClick={() => navigate('/attendance')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>View Attendance Roster</span>
                </button>

                <button
                  onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Edit size={14} />
                  <span>Edit Event Parameters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
