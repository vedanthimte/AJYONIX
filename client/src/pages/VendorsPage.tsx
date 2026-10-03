import React, { useState, useEffect } from 'react';
import { VendorService } from '../services/logistics.service';
import { Vendor } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { Truck, Plus, Star, Phone, DollarSign, Edit, Trash2 } from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    contact: '',
    services: '',
    pricing: 0,
    rating: 4.8,
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await VendorService.getAll();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        category: vendor.category,
        contact: vendor.contact,
        services: vendor.services,
        pricing: vendor.pricing,
        rating: vendor.rating,
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        category: 'Food',
        contact: '+91 98220 12345 / info@vendor.demo',
        services: 'Buffet meals, bottled water, snacks',
        pricing: 150,
        rating: 4.8,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await VendorService.update(editingVendor.id, formData);
        showToast('Vendor profile updated', 'success');
      } else {
        await VendorService.create(formData);
        showToast('Partner vendor registered', 'success');
      }
      setIsModalOpen(false);
      loadVendors();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete vendor?')) return;
    try {
      await VendorService.delete(id);
      showToast('Vendor deleted', 'success');
      loadVendors();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vendor', 'error');
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
          <h1 className="page-title">Partner Vendor Directory</h1>
          <p className="page-subtitle">
            Manage catering, audiovisual sound engineering, flex printing, and photography suppliers
          </p>
        </div>

        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Register New Vendor</span>
        </button>
      </div>

      <div className="grid-cols-2">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span className="badge badge-ongoing" style={{ marginBottom: 6 }}>
                    {vendor.category}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                    {vendor.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleOpenModal(vendor)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: 6 }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: 6, color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#475569', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700 }}>
                  <Star size={15} fill="#f59e0b" />
                  <span>{vendor.rating} / 5.0 Rating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <DollarSign size={15} color="#10b981" />
                  <span>Base Rate: ₹{vendor.pricing}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748b', marginBottom: 14 }}>
                <Phone size={14} color="#6366f1" />
                <span>{vendor.contact}</span>
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
                <strong>Services Provided:</strong> {vendor.services}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Supplier' : 'Register New Vendor'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Vendor Company Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Food">Food & Catering</option>
                <option value="Equipment">Audio/Visual Equipment</option>
                <option value="Printing">Printing & Badges</option>
                <option value="Photography">Photography & Drone</option>
                <option value="Decoration">Stage Decoration</option>
                <option value="Transport">Transport & Logistics</option>
                <option value="Other">Other Suppliers</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                className="form-input"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contact Phone / Email</label>
              <input
                type="text"
                className="form-input"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Base Pricing (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Specifications</label>
            <textarea
              className="form-textarea"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingVendor ? 'Save Changes' : 'Register Vendor'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
