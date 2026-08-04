// src/api/expenses.ts - Make sure this is correct
import { api } from './axios';

export interface ExpenseData {
  description: string;
  amount: number;
  category: string;
  notes?: string;
}

export const expensesAPI = {
  // Get all expenses
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  // Create expense
  create: async (data: ExpenseData) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  // Update expense status (approve/reject)
  updateStatus: async (id: string, status: 'approved' | 'rejected') => {
    const response = await api.patch(`/expenses/${id}/status`, { status });
    return response.data;
  },

  // Delete expense
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};