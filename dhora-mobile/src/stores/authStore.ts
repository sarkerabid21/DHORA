import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  locationArea?: string;
  preferencesCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  error: string | null;

  loadInitialState: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<{ success: boolean; devOtp?: string; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  register: (
    fullName: string,
    email: string,
    password: string,
    otp?: string
  ) => Promise<{ success: boolean; otpRequired?: boolean; devOtp?: string; message?: string }>;
  loginWithGoogle: (email?: string, fullName?: string, avatarUrl?: string) => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  updateStylePreferences: (preferences: any) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isOnboardingCompleted: false,
  isLoading: true,
  error: null,

  loadInitialState: async () => {
    try {
      const [token, onboarding, savedUser] = await Promise.all([
        AsyncStorage.getItem('@dhora_auth_token'),
        AsyncStorage.getItem('@dhora_onboarding_completed'),
        AsyncStorage.getItem('@dhora_user'),
      ]);

      set({
        token: token || null,
        isAuthenticated: !!token,
        isOnboardingCompleted: onboarding === 'true',
        user: savedUser ? JSON.parse(savedUser) : null,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem('@dhora_onboarding_completed', 'true');
    set({ isOnboardingCompleted: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      const mappedUser: User = {
        id: user._id || user.id,
        email: user.email,
        fullName: user.fullName || user.email.split('@')[0],
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || user.email)}`,
        locationArea: user.locationArea || 'Dhaka (Dhanmondi)',
        preferencesCompleted: true,
      };

      await Promise.all([
        AsyncStorage.setItem('@dhora_auth_token', token),
        AsyncStorage.setItem('@dhora_user', JSON.stringify(mappedUser)),
      ]);

      set({
        token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Login failed. Please check credentials.', isLoading: false });
      return false;
    }
  },

  sendOtp: async (email) => {
    try {
      const response = await api.post('/auth/send-otp', { email });
      return {
        success: true,
        devOtp: response.data?.data?.devOtp,
        message: response.data?.message || 'OTP code sent to email.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to send verification OTP.',
      };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { token, user } = response.data.data;
      const mappedUser: User = {
        id: user._id || user.id,
        email: user.email,
        fullName: user.fullName || user.email.split('@')[0],
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || user.email)}`,
        locationArea: user.locationArea || 'Dhaka (Dhanmondi)',
        preferencesCompleted: user.preferencesCompleted || false,
      };

      await Promise.all([
        AsyncStorage.setItem('@dhora_auth_token', token),
        AsyncStorage.setItem('@dhora_user', JSON.stringify(mappedUser)),
      ]);

      set({
        token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Invalid verification code.', isLoading: false });
      return false;
    }
  },

  register: async (fullName, email, password, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password,
        otp,
        consentAgreed: true,
      });

      if (response.data?.data?.otpRequired) {
        set({ isLoading: false });
        return {
          success: true,
          otpRequired: true,
          devOtp: response.data.data?.devOtp,
          message: response.data.message,
        };
      }

      const { token, user } = response.data.data;
      const mappedUser: User = {
        id: user._id || user.id,
        email: user.email,
        fullName: user.fullName || fullName || user.email.split('@')[0],
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || fullName || user.email)}`,
        locationArea: user.locationArea || 'Dhaka (Dhanmondi)',
        preferencesCompleted: false,
      };

      await Promise.all([
        AsyncStorage.setItem('@dhora_auth_token', token),
        AsyncStorage.setItem('@dhora_user', JSON.stringify(mappedUser)),
      ]);

      set({
        token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (err: any) {
      set({ error: err.message || 'Registration failed.', isLoading: false });
      return { success: false, message: err.message };
    }
  },

  loginWithGoogle: async (email, fullName, avatarUrl) => {
    set({ isLoading: true, error: null });
    try {
      const googleEmail = (email || 'google.user@dhora.fashion').toLowerCase().trim();
      const googleName = fullName || googleEmail.split('@')[0];
      const googleAvatar =
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName)}&backgroundColor=0284c7`;

      const response = await api.post('/auth/google', {
        email: googleEmail,
        fullName: googleName,
        avatarUrl: googleAvatar,
      });
      const { token, user } = response.data.data;
      const mappedUser: User = {
        id: user._id || user.id,
        email: user.email,
        fullName: user.fullName || googleName,
        avatarUrl: user.avatarUrl || googleAvatar,
        locationArea: user.locationArea || 'Dhaka (Gulshan)',
        preferencesCompleted: true,
      };

      await Promise.all([
        AsyncStorage.setItem('@dhora_auth_token', token),
        AsyncStorage.setItem('@dhora_user', JSON.stringify(mappedUser)),
      ]);

      set({
        token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Google authentication failed.', isLoading: false });
      return false;
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/guest', {});
      const { token, user } = response.data.data;
      const mappedUser: User = {
        id: user._id || user.id,
        email: user.email,
        fullName: user.fullName || 'Fashion Explorer (Guest)',
        avatarUrl:
          user.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0284c7`,
        locationArea: user.locationArea || 'Dhaka (Dhanmondi)',
        preferencesCompleted: true,
      };

      await Promise.all([
        AsyncStorage.setItem('@dhora_auth_token', token),
        AsyncStorage.setItem('@dhora_user', JSON.stringify(mappedUser)),
      ]);

      set({
        token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Guest session initialization failed.', isLoading: false });
      return false;
    }
  },

  updateStylePreferences: async (preferences) => {
    set({ isLoading: true });
    try {
      await api.put('/users/style-preferences', preferences);
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, preferencesCompleted: true };
        await AsyncStorage.setItem('@dhora_user', JSON.stringify(updatedUser));
        set({ user: updatedUser, isLoading: false });
      }
      return true;
    } catch (err: any) {
      // Fallback
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, preferencesCompleted: true };
        await AsyncStorage.setItem('@dhora_user', JSON.stringify(updatedUser));
        set({ user: updatedUser, isLoading: false });
      }
      return true;
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem('@dhora_auth_token'),
      AsyncStorage.removeItem('@dhora_user'),
    ]);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  clearError: () => set({ error: null }),
}));
