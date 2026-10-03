import api from './api';
import { Registration } from '../types';

export const RegistrationService = {
  register: async (eventId: string): Promise<Registration> => {
    const res = await api.post(`/events/${eventId}/register`);
    return res.data.data;
  },

  getMyRegistrations: async (): Promise<Registration[]> => {
    const res = await api.get('/registrations/my');
    return res.data.data;
  },

  getById: async (id: string): Promise<Registration> => {
    const res = await api.get(`/registrations/${id}`);
    return res.data.data;
  },

  getEventRegistrations: async (eventId: string): Promise<Registration[]> => {
    const res = await api.get(`/events/${eventId}/registrations`);
    return res.data.data;
  },
};
