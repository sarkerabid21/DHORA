import { create } from 'zustand';
import { api } from '../services/api';
import { GroundedOutfit, ChatMessage, WeatherInfo } from '../types/stylist';

interface StylistState {
  chatMessages: ChatMessage[];
  savedLooks: GroundedOutfit[];
  todayOutfit: GroundedOutfit | null;
  weather: WeatherInfo;
  isTyping: boolean;
  isLoading: boolean;

  sendMessage: (text: string) => Promise<void>;
  generateAnotherOutfit: (occasion?: string) => Promise<GroundedOutfit | null>;
  saveOutfit: (outfit: GroundedOutfit) => Promise<void>;
  unsaveOutfit: (outfitId: string) => Promise<void>;
  submitFeedback: (outfitId: string, rating: 'LIKE' | 'DISLIKE', reason?: string) => Promise<void>;
  fetchSavedLooks: () => Promise<void>;
  fetchTodayWeatherOutfit: () => Promise<void>;
  reset: () => void;
}

export const useStylistStore = create<StylistState>((set, get) => ({
  chatMessages: [
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: 'Assalamu Alaikum! I am DHORA AI Stylist. "Style-ta Dhoro, Nijer Moto Cholo". Every outfit recommendation I create uses only the clothes already saved in your digital closet. What are you dressing for today?',
      createdAt: new Date().toISOString(),
    },
  ],
  savedLooks: [],
  todayOutfit: null,
  weather: {
    city: 'Dhanmondi, Dhaka',
    temperature: 29,
    condition: 'Partly Cloudy',
    humidity: 65,
    rainProbability: 15,
    recommendationHint: 'Comfortable weather. Ideal for smart casual layered looks and cotton shirts.',
  },
  isTyping: false,
  isLoading: false,

  sendMessage: async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isTyping: true,
    }));

    try {
      const response = await api.post('/stylist/chat', { message: text });
      const { replyText, suggestedOutfit } = response.data.data;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        outfit: suggestedOutfit,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, assistantMsg],
        isTyping: false,
      }));
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I could not process the recommendation right now. Please check your connection and try again.',
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, errorMsg],
        isTyping: false,
      }));
    }
  },

  generateAnotherOutfit: async (occasion: string = 'University / Casual') => {
    try {
      const response = await api.post('/stylist/generate-outfits', { occasion });
      if (response.data?.data && response.data.data.length > 0) {
        const nextOutfit = response.data.data[0];
        set({ todayOutfit: nextOutfit });
        return nextOutfit;
      }
    } catch (e) {}

    return null;
  },

  saveOutfit: async (outfit: GroundedOutfit) => {
    const newLook: GroundedOutfit = {
      ...outfit,
      _id: outfit._id || 'look_' + Date.now().toString(),
      isFavorite: true,
    };

    set((state) => ({
      savedLooks: [newLook, ...state.savedLooks.filter((l) => l.title !== outfit.title)],
    }));

    try {
      await api.post('/stylist/save', outfit);
    } catch (e) {}
  },

  unsaveOutfit: async (outfitId: string) => {
    set((state) => ({
      savedLooks: state.savedLooks.filter((l) => l._id !== outfitId),
    }));

    try {
      await api.delete(`/stylist/saved/${outfitId}`);
    } catch (e) {}
  },

  submitFeedback: async (outfitId: string, rating: 'LIKE' | 'DISLIKE', reason?: string) => {
    try {
      await api.post('/stylist/feedback', { outfitId, rating, feedbackReason: reason });
    } catch (e) {}
  },

  fetchSavedLooks: async () => {
    try {
      const res = await api.get('/stylist/saved');
      if (res.data?.data) {
        set({ savedLooks: res.data.data });
      }
    } catch (e) {}
  },

  fetchTodayWeatherOutfit: async () => {
    try {
      const res = await api.get('/stylist/weather-outfit');
      if (res.data?.data) {
        if (res.data.data.weather) {
          set({ weather: res.data.data.weather });
        }
        set({ todayOutfit: res.data.data.outfit || null });
      }
    } catch (e) {
      set({ todayOutfit: null });
    }
  },

  reset: () => {
    set({
      chatMessages: [
        {
          id: 'welcome_1',
          sender: 'assistant',
          text: 'Assalamu Alaikum! I am DHORA AI Stylist. "Style-ta Dhoro, Nijer Moto Cholo". Every outfit recommendation I create uses only the clothes already saved in your digital closet. What are you dressing for today?',
          createdAt: new Date().toISOString(),
        },
      ],
      todayOutfit: null,
      savedLooks: [],
      isTyping: false,
      isLoading: false,
    });
  },
}));
