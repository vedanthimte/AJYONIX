import React, { useState, useEffect } from 'react';
import { VenueService } from '../services/logistics.service';
import { Venue } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Building2, Plus, Users, MapPin, DollarSign, Check, X, Edit, Trash2 } from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 200,
    facilities: '',
    availability: true,
    price: 0,
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const data = await VenueService.getAll();
      setVenues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (venue?: Venue) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        facilities: venue.facilities,
        availability: venue.availability,
        price: venue.price,
      });
    } else {
      setEditingVenue(null);
      setFormData({
        name: '',
        location: '',
        capacity: 200,
        facilities: 'Dual HD Projectors, Dolby Sound Rig, Central AC, High-speed WiFi',
        availability: true,
        price: 5000,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await VenueService.update(editingVenue.id, formData);
        showToast('Venue updated successfully', 'success');
      } else {
        await VenueService.create(formData);
        showToast('Venue created successfully', 'success');
      }
      setIsModalOpen(false);
      loadVenues();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await VenueService.delete(id);
      showToast('Venue deleted', 'success');
      loadVenues();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete venue', 'error');
    }
  };

  return (
    <div className="page-container">
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
          <h1 className="page-title">Campus Venue Management</h1>
          <p className="page-subtitle">
            Configure institutional auditoriums, computing labs, and open-air arenas for college events
          </p>
        </div>

        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Venue</span>
        </button>
      </div>

      {/* Venues Grid */}
      <div className="grid-cols-2">
        {venues.map((venue) => (
          <div key={venue.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span
                    className={`badge badge-${venue.availability ? 'published' : 'cancelled'}`}
                    style={{ marginBottom: 6 }}
                  >
                    {venue.availability ? 'AVAILABLE FOR BOOKING' : 'MAINTENANCE HOLD'}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                    {venue.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleOpenModal(venue)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: 6 }}
                    title="Edit Venue"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: 6, color: '#ef4444' }}
                    title="Delete Venue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="#6366f1" />
                  <span>{venue.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} color="#06b6d4" />
                  <span>Seating Capacity: <strong>{venue.capacity} attendees</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} color="#10b981" />
                  <span>Booking Cost: ₹{venue.price.toLocaleString('en-IN')} / session</span>
                </div>
              </div>

              <div
                style={{
                  padding: 12,
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12.5,
                  color: '#334155',
                  border: '1px solid var(--border-light)',
                }}
              >
                <strong>Facilities:</strong> {venue.facilities}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? 'Edit Venue Parameters' : 'Add Campus Venue'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Venue Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / Building Block</label>
            <input
              type="text"
              className="form-input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Max Capacity</label>
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
              <label className="form-label">Booking Rate (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Equipped Facilities & AV Tech</label>
            <textarea
              className="form-textarea"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 20px' }}>
            <input
              type="checkbox"
              id="avail"
              checked={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="avail" style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
              Venue is currently operational and available for schedule bookings
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingVenue ? 'Save Changes' : 'Register Venue'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
