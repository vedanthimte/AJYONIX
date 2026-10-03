import api from './api';

export const AIService = {
  planEvent: async (params: {
    eventType: string;
    expectedParticipants: number;
    durationHours: number;
    budget: number;
    venueRequirements?: string;
  }) => {
    const res = await api.post('/ai/planner', params);
    return res.data.data;
  },

  askAssistant: async (query: string) => {
    const res = await api.post('/ai/assistant', { query });
    return res.data.data;
  },

  analyzeSentiment: async (text: string) => {
    const res = await api.post('/ai/sentiment', { text });
    return res.data.data;
  },

  predictFoodWaste: async (params: {
    registeredParticipants: number;
    historicalAttendancePercentage?: number;
    eventType?: string;
    numberOfMeals?: number;
  }) => {
    const res = await api.post('/ai/food-prediction', params);
    return res.data.data;
  },

  getRecommendations: async (params: {
    eventType: string;
    participants: number;
    budget: number;
  }) => {
    const res = await api.post('/ai/recommendations', params);
    return res.data.data;
  },
};

export const ReportService = {
  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data.data;
  },

  getEventReport: async (eventId: string) => {
    const res = await api.get(`/reports/event/${eventId}`);
    return res.data.data;
  },
};

export const NotificationService = {
  getMyNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data.data;
  },
};
