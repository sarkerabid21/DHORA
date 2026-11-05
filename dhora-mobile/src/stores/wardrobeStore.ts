import { create } from 'zustand';
import { api } from '../services/api';
import { ClothingItem, ClothingCategory, ClothingStatus, RecognizedAttributes } from '../types/clothing';

interface WardrobeState {
  items: ClothingItem[];
  selectedCategory: string;
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  isRecognizing: boolean;
  error: string | null;

  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;

  fetchItems: () => Promise<void>;
  recognizeImage: (imageBase64OrUrl: string) => Promise<RecognizedAttributes>;
  addItem: (newItem: Omit<ClothingItem, '_id' | 'userId' | 'timesWorn' | 'createdAt'>) => Promise<ClothingItem>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  updateStatus: (id: string, status: ClothingStatus) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reset: () => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  selectedCategory: 'All',
  searchQuery: '',
  statusFilter: 'ALL',
  isLoading: false,
  isRecognizing: false,
  error: null,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wardrobe');
      if (response.data?.data) {
        set({ items: response.data.data, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch (e) {
      set({ items: [], isLoading: false });
    }
  },

  recognizeImage: async (imageBase64OrUrl: string) => {
    set({ isRecognizing: true });
    try {
      const response = await api.post('/wardrobe/recognize', {
        imageUrl: imageBase64OrUrl.startsWith('http') ? imageBase64OrUrl : undefined,
        imageBase64: !imageBase64OrUrl.startsWith('http') ? imageBase64OrUrl : undefined,
      });
      set({ isRecognizing: false });
      return response.data.data;
    } catch (e: any) {
      set({ isRecognizing: false });
      return {
        name: 'Clothing Garment',
        category: 'TOPS',
        subcategory: 'Garment',
        primaryColor: 'Neutral',
        secondaryColors: [],
        pattern: 'Solid',
        fabric: 'Cotton',
        seasonality: 'ALL_SEASON',
        formalness: 'CASUAL',
      };
    }
  },

  addItem: async (itemData) => {
    try {
      const response = await api.post('/wardrobe', itemData);
      if (response.data?.data) {
        const serverItem = response.data.data;
        set((state) => ({ items: [serverItem, ...state.items] }));
        return serverItem;
      }
    } catch (e) {
      console.warn('Wardrobe item save error:', e);
    }

    const fallbackItem: ClothingItem = {
      ...itemData,
      _id: 'item_' + Date.now().toString(),
      userId: 'current_user',
      timesWorn: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ items: [fallbackItem, ...state.items] }));
    return fallbackItem;
  },

  updateItem: async (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item._id === id ? { ...item, ...updates } : item
      ),
    }));

    try {
      await api.patch(`/wardrobe/${id}`, updates);
    } catch (e) {}
  },

  updateStatus: async (id, status) => {
    set((state) => ({
      items: state.items.map((item) =>
        item._id === id ? { ...item, status } : item
      ),
    }));

    try {
      await api.patch(`/wardrobe/${id}/status`, { status });
    } catch (e) {}
  },

  toggleFavorite: async (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item._id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ),
    }));

    try {
      await api.patch(`/wardrobe/${id}/favorite`, {});
    } catch (e) {}
  },

  deleteItem: async (id) => {
    set((state) => ({
      items: state.items.filter((item) => item._id !== id),
    }));

    try {
      await api.delete(`/wardrobe/${id}`);
    } catch (e) {}
  },

  reset: () => {
    set({
      items: [],
      selectedCategory: 'All',
      searchQuery: '',
      statusFilter: 'ALL',
      isLoading: false,
      error: null,
    });
  },
}));
