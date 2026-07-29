// src/api/repairs.ts
import { api } from './axios';

export interface RepairData {
  deviceModel: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  issueDescription: string;
  status: 'Pending' | 'Diagnosing' | 'Repairing' | 'Ready' | 'Collected';
  financials?: {
    totalEstimate: number;
    amountPaid: number;
    balanceDue?: number;
    paymentStatus?: string;
  };
  images?: string[];
}

export const repairsAPI = {
  // Get all repairs
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/repairs', { params });
    return response.data;
  },

  // Get single repair
  getOne: async (id: string) => {
    const response = await api.get(`/repairs/${id}`);
    return response.data;
  },

  // Create repair
  create: async (data: RepairData) => {
    const response = await api.post('/repairs', data);
    return response.data;
  },

  // Update repair
  update: async (id: string, data: Partial<RepairData>) => {
    const response = await api.put(`/repairs/${id}`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/repairs/${id}/status`, { status });
    return response.data;
  },

  // Delete repair
  delete: async (id: string) => {
    const response = await api.delete(`/repairs/${id}`);
    return response.data;
  },
};