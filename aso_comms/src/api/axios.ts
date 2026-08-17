// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // Your Express server address
  withCredentials: true, // Important for Passport sessions
  headers: {
    'Content-Type': 'application/json',
  },
});