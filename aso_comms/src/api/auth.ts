// src/api/auth.ts
import { api } from './axios';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface OTPVerifyData {
  email: string;
  otp: string;
  purpose: 'signup' | 'reset' | 'staff';
}

export const authAPI = {
  // Login
  login: async (data: LoginData) => {
    const response = await api.post('/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterData) => {
    const response = await api.post('/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: OTPVerifyData) => {
    const response = await api.post('/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data: { email: string; purpose: string }) => {
    const response = await api.post('/resend-otp', data);
    return response.data;
  },

  // Forgot Password - Request OTP
  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/forgot-password', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: { password: string }) => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.get('/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/current-user');
    return response.data;
  },
};