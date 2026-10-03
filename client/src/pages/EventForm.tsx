import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../services/event.service';
import { VenueService } from '../services/logistics.service';
import { Venue, EventType, EventStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { Calendar, Save, ArrowLeft } from 'lucide-react';

export const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'WORKSHOP',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venueId: '',
    capacity: 200,
    registrationFee: 0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    loadVenues();
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadVenues = async () => {
    try {
      const data = await VenueService.getAll();
      setVenues(data);
      if (data.length > 0 && !formData.venueId) {
        setFormData((prev) => ({ ...prev, venueId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvent = async () => {
    try {
      const data = await EventService.getById(id!);
      setFormData({
        name: data.name,
        description: data.description,
        type: data.type,
        date: new Date(data.date).toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        venueId: data.venueId || '',
        capacity: data.capacity,
        registrationFee: data.registrationFee,
        image: data.image || '',
        status: data.status,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to load event', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      showToast('Name and description are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await EventService.update(id!, formData as any);
        showToast('Event updated successfully', 'success');
      } else {
        const created = await EventService.create(formData as any);
        showToast('Event published successfully!', 'success');
        navigate(`/events/${created.id}`);
        return;
      }
      navigate(`/events/${id}`);
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>
              {isEdit ? 'Edit Event Details' : 'Create & Publish New Event'}
            </h2>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Configure scheduling, ticketing rules, and venue reservation
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Name / Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Smart India Campus Hackathon 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Description & Agendas</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 120 }}
              placeholder="Detailed breakdown of rules, guest speakers, prerequisites, and itinerary..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Event Category</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="HACKATHON">HACKATHON</option>
                <option value="WORKSHOP">WORKSHOP</option>
                <option value="TECHNICAL">TECHNICAL CONTEST</option>
                <option value="CULTURAL">CULTURAL FEST</option>
                <option value="SEMINAR">SEMINAR</option>
                <option value="CONFERENCE">CONFERENCE</option>
                <option value="SPORTS">SPORTS</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Venue</label>
              <select
                className="form-select"
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Cap: {v.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="09:30 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="05:00 PM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                min={1}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registration Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.registrationFee}
                onChange={(e) => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                <option value="ONGOING">ONGOING</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Banner Image URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            disabled={loading}
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Event' : 'Publish Event'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
