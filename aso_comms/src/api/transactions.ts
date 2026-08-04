// src/api/transactions.ts
import { api } from './axios';

export const transactionsAPI = {
  // Get all transactions
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Get transactions by date range
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/transactions', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};