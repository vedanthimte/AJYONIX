import api from './api';
import { FinanceTransaction, Invoice } from '../types';

export const FinanceService = {
  getOverview: async (eventId?: string) => {
    const res = await api.get('/finance', { params: { eventId } });
    return res.data.data;
  },

  createTransaction: async (data: Partial<FinanceTransaction>): Promise<FinanceTransaction> => {
    const res = await api.post('/finance', data);
    return res.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/finance/${id}`);
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const res = await api.get('/finance/invoices/list');
    return res.data.data;
  },

  createInvoice: async (data: Partial<Invoice>): Promise<Invoice> => {
    const res = await api.post('/finance/invoices', data);
    return res.data.data;
  },
};
