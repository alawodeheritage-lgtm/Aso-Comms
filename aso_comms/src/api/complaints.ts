// src/api/complaints.ts
import { api } from './axios';

export interface ComplaintData {
  subject: string;
  description: string;
  category: string;
  severity?: 'low' | 'medium' | 'high';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  images?: string[];
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

  // Update complaint
  update: async (id: string, data: Partial<ComplaintData>) => {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, data: { status: string; resolutionNotes?: string }) => {
    const response = await api.patch(`/complaints/${id}/status`, data);
    return response.data;
  },

  // Delete complaint
  delete: async (id: string) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};