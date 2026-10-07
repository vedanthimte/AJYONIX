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

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    department?: string;
    avatar?: string;
  }): Promise<User> => {
    const res = await api.put('/auth/profile', data);
    return res.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ resetCode?: string; message: string }> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data.data;
  },

  resetPassword: async (data: {
    email: string;
    resetCode: string;
    newPassword: string;
  }): Promise<void> => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
};
