import api from './api';
import { Venue, Vendor, Volunteer, VolunteerAssignment } from '../types';

export const VenueService = {
  getAll: async (): Promise<Venue[]> => {
    const res = await api.get('/venues');
    return res.data.data;
  },
  create: async (data: Partial<Venue>): Promise<Venue> => {
    const res = await api.post('/venues', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Venue>): Promise<Venue> => {
    const res = await api.put(`/venues/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },
};

export const VendorService = {
  getAll: async (): Promise<Vendor[]> => {
    const res = await api.get('/vendors');
    return res.data.data;
  },
  create: async (data: Partial<Vendor>): Promise<Vendor> => {
    const res = await api.post('/vendors', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
    const res = await api.put(`/vendors/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};

export const VolunteerService = {
  getAll: async (): Promise<Volunteer[]> => {
    const res = await api.get('/volunteers');
    return res.data.data;
  },
  create: async (data: Partial<Volunteer>): Promise<Volunteer> => {
    const res = await api.post('/volunteers', data);
    return res.data.data;
  },
  assignDuty: async (data: { eventId: string; volunteerId: string; duty: string; shift: string }): Promise<VolunteerAssignment> => {
    const res = await api.post('/volunteers/assign', data);
    return res.data.data;
  },
  getMyDuties: async (): Promise<VolunteerAssignment[]> => {
    const res = await api.get('/volunteers/my-duties');
    return res.data.data;
  },
  deleteAssignment: async (id: string): Promise<void> => {
    await api.delete(`/volunteers/assign/${id}`);
  },
};
