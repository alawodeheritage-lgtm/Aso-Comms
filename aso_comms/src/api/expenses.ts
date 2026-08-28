// src/api/expenses.ts
import { api } from './axios';

export interface ExpenseData {
  description: string;
  amount: number;
  category: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export const expensesAPI = {
  // Get all expenses
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Get single expense
  getOne: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  create: async (data: ExpenseData) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Update expense
  update: async (id: string, data: Partial<ExpenseData>) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/expenses/${id}/status`, { status });
    return response.data;
  },

  // Delete expense
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};