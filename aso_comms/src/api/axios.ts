// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,  // ✅ MUST BE TRUE
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ✅ Add interceptors for debugging
api.interceptors.request.use((config) => {
  console.log('🚀 API Request:', config.baseURL + config.url)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url)
    return Promise.reject(error)
  }
)

export { api }