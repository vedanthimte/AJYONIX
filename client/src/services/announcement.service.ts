import api from './api';
import { Announcement } from '../types';

export const AnnouncementService = {
  getAll: async (params?: { eventId?: string; priority?: string }): Promise<Announcement[]> => {
    const res = await api.get('/announcements', { params });
    return res.data.data;
  },

  create: async (data: Partial<Announcement>): Promise<Announcement> => {
    const res = await api.post('/announcements', data);
    return res.data.data;
  },
};
