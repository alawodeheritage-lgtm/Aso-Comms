// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,  // ✅ CRITICAL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Add request interceptor to log the URL and credentials
api.interceptors.request.use((config) => {
  console.log('🚀 API Request:', config.baseURL + config.url);
  console.log('🔑 With Credentials:', config.withCredentials);
  return config;
});

export { api };