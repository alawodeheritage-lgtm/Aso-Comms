// src/api/notifications.ts
import { api } from './axios';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'complaint' | 'repair' | 'payment' | 'system';
  icon: string;
  color: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  link?: string;
  relatedId?: string;
}

export const notificationsAPI = {
  // Get all notifications
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};