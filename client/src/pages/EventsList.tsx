import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../services/event.service';
import { Event, EventType, EventStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedStatus]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await EventService.getAll({
        search: search || undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const isManager = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

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
          <h1 className="page-title">Campus Events & Workshops</h1>
          <p className="page-subtitle">
            Discover, register, and attend hackathons, conferences, and technical symposiums
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => navigate('/admin/events/create')}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', position: 'relative' }}
        >
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12 }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search events by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="WORKSHOP">Workshops</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="TECHNICAL">Technical</option>
            <option value="CULTURAL">Cultural</option>
            <option value="SEMINAR">Seminars</option>
            <option value="CONFERENCE">Conferences</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="ONGOING">Ongoing Today</option>
            <option value="PUBLISHED">Upcoming Published</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ height: 320 }}>
              <div className="skeleton" style={{ height: 140, marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 20 }} />
              <div className="skeleton" style={{ height: 36, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Calendar size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>No Events Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Try adjusting your search criteria or filter tags.
          </p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {events.map((event) => {
            const registeredCount = event._count?.registrations || 0;
            const capacityRatio = Math.min(100, Math.round((registeredCount / event.capacity) * 100));

            return (
              <div
                key={event.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Hero Card Image */}
                <div style={{ height: 155, position: 'relative', overflow: 'hidden' }}>
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
                          : event.status === 'REGISTRATION_OPEN'
                          ? 'published'
                          : 'draft'
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

                {/* Card Body */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {event.type}
                    </div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                      {event.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: 16,
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
                    {/* Time & Venue */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#475569', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="#6366f1" />
                        <span>
                          {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color="#06b6d4" />
                        <span>{event.venueName || 'Campus Venue'}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>
                        <span>Capacity Filled</span>
                        <strong style={{ color: '#1e293b' }}>
                          {registeredCount} / {event.capacity} seats ({capacityRatio}%)
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 99 }}>
                        <div
                          style={{
                            width: `${capacityRatio}%`,
                            height: '100%',
                            backgroundColor: capacityRatio >= 90 ? '#ef4444' : '#4f46e5',
                            borderRadius: 99,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <span>View & Register</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
