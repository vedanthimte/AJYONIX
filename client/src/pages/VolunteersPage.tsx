import React, { useState, useEffect } from 'react';
import { VolunteerService } from '../services/logistics.service';
import { EventService } from '../services/event.service';
import { Volunteer, VolunteerAssignment, Event } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Users2, Plus, CalendarCheck, Clock, UserCheck, Trash2, Mail, Phone } from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewVolModalOpen, setIsNewVolModalOpen] = useState(false);

  // Form State
  const [assignForm, setAssignForm] = useState({
    eventId: '',
    volunteerId: '',
    duty: 'Main Gate QR Registration & Pass Desk',
    shift: '09:00 AM - 01:00 PM',
  });

  const [volForm, setVolForm] = useState({
    name: '',
    email: '',
    phone: '',
    skills: 'Registration Desk, Fast QR Scanner, Crowd Control',
    availability: 'Full Day Available',
    department: 'Computer Science & Engineering',
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [volData, eventsData] = await Promise.all([
        VolunteerService.getAll(),
        EventService.getAll(),
      ]);
      setVolunteers(volData);
      setEvents(eventsData);

      if (eventsData.length > 0 && !assignForm.eventId) {
        setAssignForm((prev) => ({ ...prev, eventId: eventsData[0].id }));
      }
      if (volData.length > 0 && !assignForm.volunteerId) {
        setAssignForm((prev) => ({ ...prev, volunteerId: volData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.eventId || !assignForm.volunteerId || !assignForm.duty) {
      showToast('All assignment fields are required', 'warning');
      return;
    }

    try {
      await VolunteerService.assignDuty(assignForm);
      showToast('Duty assigned successfully to volunteer!', 'success');
      setIsAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign duty', 'error');
    }
  };

  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await VolunteerService.create(volForm);
      showToast('Volunteer registered successfully', 'success');
      setIsNewVolModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to register volunteer', 'error');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Remove this duty assignment?')) return;
    try {
      await VolunteerService.deleteAssignment(id);
      showToast('Duty assignment removed', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove assignment', 'error');
    }
  };

  // Flatten assignments for the master duty roster table
  const allAssignments = volunteers.flatMap((v) =>
    (v.assignments || []).map((a) => ({
      ...a,
      volunteerName: v.name,
      volunteerEmail: v.email,
    }))
  );

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
          <h1 className="page-title">Volunteer Management & Duty Rosters</h1>
          <p className="page-subtitle">
            Recruit student volunteers, coordinate shift timings, and allocate gate scanner stations
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setIsNewVolModalOpen(true)} className="btn btn-secondary">
            <Plus size={16} />
            <span>Add Volunteer</span>
          </button>
          <button onClick={() => setIsAssignModalOpen(true)} className="btn btn-primary">
            <CalendarCheck size={16} />
            <span>Assign Duty Shift</span>
          </button>
        </div>
      </div>

      {/* Duty Roster Table */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Live Duty Roster Assignments</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Assigned volunteers across check-in desks, tech rigs, and catering stations
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Assigned Event</th>
                <th>Station Duty</th>
                <th>Shift Schedule</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 10px', color: '#94a3b8' }}>
                    No duty shifts assigned yet. Click "Assign Duty Shift" to deploy volunteers.
                  </td>
                </tr>
              ) : (
                allAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{assignment.volunteerName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {assignment.volunteerEmail}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {assignment.event?.name || 'Campus Event'}
                    </td>
                    <td>{assignment.duty}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}>
                        <Clock size={13} color="#6366f1" />
                        <span>{assignment.shift}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-published">{assignment.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: 6, color: '#ef4444' }}
                        title="Remove Assignment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Volunteer Profiles Grid */}
      <div className="card-header">
        <h3 className="card-title">Registered Volunteer Corps ({volunteers.length})</h3>
      </div>

      <div className="grid-cols-3">
        {volunteers.map((vol) => (
          <div key={vol.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {vol.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{vol.name}</h4>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{vol.department}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="#6366f1" />
                <span>{vol.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} color="#06b6d4" />
                <span>{vol.phone || '+91 98220 00000'}</span>
              </div>
            </div>

            <div
              style={{
                padding: 10,
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                color: '#334155',
                border: '1px solid var(--border-light)',
              }}
            >
              <strong>Skills:</strong> {vol.skills}
            </div>
          </div>
        ))}
      </div>

      {/* Duty Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Volunteer to Event Duty Shift"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Event</label>
            <select
              className="form-select"
              value={assignForm.eventId}
              onChange={(e) => setAssignForm({ ...assignForm, eventId: e.target.value })}
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Volunteer</label>
            <select
              className="form-select"
              value={assignForm.volunteerId}
              onChange={(e) => setAssignForm({ ...assignForm, volunteerId: e.target.value })}
            >
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duty Task / Station</label>
            <input
              type="text"
              className="form-input"
              value={assignForm.duty}
              onChange={(e) => setAssignForm({ ...assignForm, duty: e.target.value })}
              placeholder="e.g. Main Gate QR Registration & Pass Desk"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shift Hours</label>
            <input
              type="text"
              className="form-input"
              value={assignForm.shift}
              onChange={(e) => setAssignForm({ ...assignForm, shift: e.target.value })}
              placeholder="09:00 AM - 01:00 PM"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Confirm Duty Assignment
          </button>
        </form>
      </Modal>

      {/* Add New Volunteer Modal */}
      <Modal
        isOpen={isNewVolModalOpen}
        onClose={() => setIsNewVolModalOpen(false)}
        title="Register New Student Volunteer"
      >
        <form onSubmit={handleCreateVolunteer}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={volForm.name}
              onChange={(e) => setVolForm({ ...volForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={volForm.email}
                onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={volForm.phone}
                onChange={(e) => setVolForm({ ...volForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={volForm.department}
              onChange={(e) => setVolForm({ ...volForm, department: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Skills / Capabilities</label>
            <textarea
              className="form-textarea"
              value={volForm.skills}
              onChange={(e) => setVolForm({ ...volForm, skills: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Add Volunteer to Roster
          </button>
        </form>
      </Modal>
    </div>
  );
};
