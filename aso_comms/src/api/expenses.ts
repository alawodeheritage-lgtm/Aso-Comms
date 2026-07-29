// src/api/expenses.ts
import { api } from './axios';

export interface ExpenseData {
  description: string;
  amount: number;
  category: 'Parts Purchase' | 'Shop Rent' | 'Tools/Equipment' | 'Electricity/Utility' | 'Transport' | 'Other';
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

  // Delete expense
  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};