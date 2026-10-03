import api from './api';

export const AttendanceService = {
  checkIn: async (payload: { qrData?: string; registrationCode?: string; eventId?: string }) => {
    const res = await api.post('/attendance/check-in', payload);
    return res.data.data;
  },

  checkOut: async (payload: { qrData?: string; registrationCode?: string; eventId?: string }) => {
    const res = await api.post('/attendance/check-out', payload);
    return res.data.data;
  },

  getEventAttendance: async (eventId: string) => {
    const res = await api.get(`/attendance/event/${eventId}`);
    return res.data.data;
  },
};
