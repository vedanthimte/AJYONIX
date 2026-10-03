import api from './api';
import { Event } from '../types';

export const EventService = {
  getAll: async (params?: { search?: string; type?: string; status?: string }): Promise<Event[]> => {
    const res = await api.get('/events', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Event> => {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Event>): Promise<Event> => {
    const res = await api.post('/events', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    const res = await api.put(`/events/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Event> => {
    const res = await api.patch(`/events/${id}/status`, { status });
    return res.data.data;
  },
};
