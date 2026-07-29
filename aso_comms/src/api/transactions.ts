// src/api/transactions.ts
import { api } from './axios';

export const transactionsAPI = {
  // Get all transactions
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
};