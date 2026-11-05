import { create } from 'zustand';
import { api } from '../services/api';
import { AppNotification } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        set({
          notifications: response.data.data,
          unreadCount: response.data.unreadCount || 0,
          loading: false,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to fetch notifications.',
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.log('Error marking notification read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.log('Error marking all notifications read:', err);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => {
        const item = state.notifications.find((n) => n._id === id);
        return {
          notifications: state.notifications.filter((n) => n._id !== id),
          unreadCount: item && !item.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (err) {
      console.log('Error deleting notification:', err);
    }
  },
}));
