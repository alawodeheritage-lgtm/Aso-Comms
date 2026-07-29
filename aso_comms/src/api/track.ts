// src/api/track.ts
import { api } from './axios';

export const trackAPI = {
  // Track repair by ticket ID
  trackByTicket: async (ticketId: string) => {
    const response = await api.get('/track/results', { params: { ticketId } });
    return response.data;
  },
};