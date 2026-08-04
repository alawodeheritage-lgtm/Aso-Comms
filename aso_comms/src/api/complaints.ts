// src/api/complaints.ts
import { api } from './axios';

export interface ComplaintData {
  ticketId: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: string;
  description: string;
}

export interface ComplaintStatusUpdate {
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  resolutionNotes?: string;
}

export const complaintsAPI = {
  // Get all complaints
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  // Get single complaint
  getOne: async (id: string) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Create complaint
  create: async (data: ComplaintData) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  // Update complaint status with resolution notes
  updateStatus: async (id: string, data: ComplaintStatusUpdate) => {
    const response = await api.patch(`/complaints/${id}/status`, data);
    return response.data;
  },
};