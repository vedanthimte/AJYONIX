import api from './api';
import { Certificate } from '../types';

export const CertificateService = {
  generate: async (registrationId: string): Promise<Certificate> => {
    const res = await api.post('/certificates', { registrationId });
    return res.data.data;
  },

  verify: async (certificateId: string) => {
    const res = await api.get(`/certificates/verify/${certificateId}`);
    return res.data.data;
  },

  getMyCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get('/certificates/my');
    return res.data.data;
  },
};
