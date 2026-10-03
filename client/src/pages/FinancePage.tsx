import React, { useState, useEffect } from 'react';
import { FinanceService } from '../services/finance.service';
import { EventService } from '../services/event.service';
import { VendorService } from '../services/logistics.service';
import { FinanceTransaction, Invoice, Event, Vendor } from '../types';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Download,
  Receipt,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const FinancePage: React.FC = () => {
  const [financeData, setFinanceData] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Form states
  const [transForm, setTransForm] = useState({
    eventId: '',
    description: '',
    category: 'Food',
    amount: 1000,
    type: 'EXPENSE',
    vendorId: '',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    eventId: '',
    vendorId: '',
    recipientName: '',
    recipientEmail: '',
    description: '',
    amount: 5000,
    paymentStatus: 'PAID',
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [finRes, invRes, eventsRes, vendorsRes] = await Promise.all([
        FinanceService.getOverview(),
        FinanceService.getInvoices(),
        EventService.getAll(),
        VendorService.getAll(),
      ]);

      setFinanceData(finRes);
      setInvoices(invRes);
      setEvents(eventsRes);
      setVendors(vendorsRes);

      if (eventsRes.length > 0) {
        setTransForm((prev) => ({ ...prev, eventId: eventsRes[0].id }));
        setInvoiceForm((prev) => ({ ...prev, eventId: eventsRes[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await FinanceService.createTransaction(transForm as any);
      showToast('Transaction logged successfully', 'success');
      setIsTransModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record transaction', 'error');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await FinanceService.createInvoice(invoiceForm as any);
      showToast('Official invoice generated successfully', 'success');
      setIsInvoiceModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create invoice', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Delete transaction record?')) return;
    try {
      await FinanceService.deleteTransaction(id);
      showToast('Transaction deleted', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  const summary = financeData?.summary || {
    totalIncome: 182750,
    totalExpense: 82700,
    netBalance: 100050,
  };

  const categoryBreakdown = financeData?.categoryBreakdown || [
    { category: 'Venue', expense: 15000, income: 0 },
    { category: 'Food', expense: 18500, income: 0 },
    { category: 'Equipment', expense: 28000, income: 0 },
    { category: 'Printing', expense: 6200, income: 0 },
    { category: 'TicketSales', expense: 0, income: 27750 },
    { category: 'Sponsorship', expense: 0, income: 155000 },
  ];

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
          <h1 className="page-title">Finance, Budgets & Invoicing</h1>
          <p className="page-subtitle">
            Formula: <code style={{ backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: 4, color: '#3730a3' }}>Net Balance = Income - Expenses</code> • Transparent campus event funds ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setIsInvoiceModalOpen(true)} className="btn btn-secondary">
            <Receipt size={16} />
            <span>Generate Invoice</span>
          </button>
          <button onClick={() => setIsTransModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-3" style={{ marginBottom: 28 }}>
        <StatCard
          title="Total Income (Credits)"
          value={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
          subtitle="Sponsorships + Ticket Sales"
          icon={<TrendingUp size={22} />}
          color="#059669"
        />
        <StatCard
          title="Total Expenses (Debits)"
          value={`₹${summary.totalExpense.toLocaleString('en-IN')}`}
          subtitle="Vendors, Catering & AV Rigs"
          icon={<TrendingDown size={22} />}
          color="#dc2626"
        />
        <StatCard
          title="Net Campus Balance"
          value={`₹${summary.netBalance.toLocaleString('en-IN')}`}
          subtitle="Income - Expenses"
          icon={<DollarSign size={22} />}
          color="#4f46e5"
          trend="Surplus"
        />
      </div>

      {/* Category Chart */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Expense & Revenue Allocation by Category</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Breakdown across Venue, Food & Catering, Audio/Visual, and Sponsorships
            </div>
          </div>
        </div>

        <div style={{ height: 260, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="category" fontSize={11} stroke="#64748b" />
              <YAxis fontSize={11} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="income" name="Income (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Official Invoices & Billing ({invoices.length})</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Download computer-generated PDF receipts with official Ayojanix seal
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Recipient / Payee</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Date</th>
                <th>Download PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8' }}>
                    No invoices generated yet. Click "Generate Invoice" to issue a formal bill.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.recipientName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{inv.recipientEmail}</div>
                    </td>
                    <td>{inv.description}</td>
                    <td style={{ fontWeight: 700 }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-published">{inv.paymentStatus}</span>
                    </td>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td>
                      <a
                        href={`/api/finance/invoices/${inv.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Master Financial Ledger</h3>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Itemized ledger tracking all college event debits and credits
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Associated Event</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!financeData?.transactions || financeData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px 10px', color: '#94a3b8' }}>
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                financeData.transactions.map((t: FinanceTransaction) => (
                  <tr key={t.id}>
                    <td>
                      <span
                        className={`badge badge-${
                          t.type === 'INCOME' ? 'published' : 'cancelled'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.description}</td>
                    <td>{t.category}</td>
                    <td>{t.event?.name || 'General Campus Fund'}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: t.type === 'INCOME' ? '#059669' : '#dc2626',
                      }}
                    >
                      {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: 6, color: '#ef4444' }}
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

      {/* Record Transaction Modal */}
      <Modal
        isOpen={isTransModalOpen}
        onClose={() => setIsTransModalOpen(false)}
        title="Record Financial Transaction"
      >
        <form onSubmit={handleCreateTransaction}>
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <select
              className="form-select"
              value={transForm.type}
              onChange={(e) => setTransForm({ ...transForm, type: e.target.value })}
            >
              <option value="EXPENSE">Expense (Debit Outflow)</option>
              <option value="INCOME">Income (Credit Inflow / Ticket / Sponsor)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={transForm.description}
              onChange={(e) => setTransForm({ ...transForm, description: e.target.value })}
              placeholder="e.g. Lunch Catering Invoice for Hackathon"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={transForm.category}
                onChange={(e) => setTransForm({ ...transForm, category: e.target.value })}
              >
                <option value="Food">Food & Catering</option>
                <option value="Venue">Venue Booking</option>
                <option value="Equipment">AV Equipment Rig</option>
                <option value="Printing">Printing & Badges</option>
                <option value="Marketing">Marketing & Promotion</option>
                <option value="Prizes">Prizes & Cash Awards</option>
                <option value="Sponsorship">Sponsorship Inflow</option>
                <option value="TicketSales">Ticket Registrations</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={transForm.amount}
                onChange={(e) => setTransForm({ ...transForm, amount: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Associated Event</label>
            <select
              className="form-select"
              value={transForm.eventId}
              onChange={(e) => setTransForm({ ...transForm, eventId: e.target.value })}
            >
              <option value="">General Campus Treasury</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Commit to Ledger
          </button>
        </form>
      </Modal>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Official Ayojanix Invoice"
      >
        <form onSubmit={handleCreateInvoice}>
          <div className="form-group">
            <label className="form-label">Recipient / Payee Name</label>
            <input
              type="text"
              className="form-input"
              value={invoiceForm.recipientName}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, recipientName: e.target.value })}
              placeholder="e.g. Annapurna Gourmet Caterers or Sponsor Corp"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Recipient Email</label>
            <input
              type="email"
              className="form-input"
              value={invoiceForm.recipientEmail}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, recipientEmail: e.target.value })}
              placeholder="finance@caterer.demo"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Description</label>
            <input
              type="text"
              className="form-input"
              value={invoiceForm.description}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
              placeholder="Full catering bill for 200 participants"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Total Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={invoiceForm.paymentStatus}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentStatus: e.target.value })}
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Associated Event</label>
            <select
              className="form-select"
              value={invoiceForm.eventId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, eventId: e.target.value })}
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Generate & Issue Invoice
          </button>
        </form>
      </Modal>
    </div>
  );
};
