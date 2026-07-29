// src/api/complaints.ts
import { api } from './axios';

export interface ComplaintData {
  ticketId: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: 'Faulty Repair' | 'Delayed Timeline' | 'Billing Issue' | 'Poor Service' | 'Other';
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

  // Get complaint form data (prefills)
  getNewFormData: async (ticketId?: string) => {
    const response = await api.get('/complaints/new', { params: { ticketId } });
    return response.data;
  },

  // Create complaint
  create: async (data: ComplaintData) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  // Update complaint status
  updateStatus: async (id: string, data: ComplaintStatusUpdate) => {
    const response = await api.patch(`/complaints/${id}/status`, data);
    return response.data;
  },
};