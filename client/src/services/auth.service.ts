import api from './api';
import { User } from '../types';

export const AuthService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    department?: string;
  }): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/register', userData);
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
