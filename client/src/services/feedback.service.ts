import api from './api';
import { Feedback } from '../types';

export const FeedbackService = {
  submit: async (eventId: string, data: { rating: number; comment: string; registrationCode?: string }): Promise<Feedback> => {
    const res = await api.post(`/feedback/event/${eventId}`, data);
    return res.data.data;
  },

  getEventFeedback: async (eventId: string) => {
    const res = await api.get(`/feedback/event/${eventId}`);
    return res.data.data;
  },
};
