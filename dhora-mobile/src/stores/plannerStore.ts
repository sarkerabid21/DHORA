import { create } from 'zustand';
import { api } from '../services/api';
import { GroundedOutfit } from '../types/stylist';
import { useWardrobeStore } from './wardrobeStore';

export interface CalendarEvent {
  _id: string;
  outfitId: GroundedOutfit;
  date: string; // YYYY-MM-DD
  occasionName: string;
  isWornConfirmed: boolean;
  hasLaundryConflict?: boolean;
  conflictingItems?: string[];
  notes?: string;
}

interface PlannerState {
  events: CalendarEvent[];
  selectedDate: string;
  isLoading: boolean;

  setSelectedDate: (date: string) => void;
  fetchEvents: () => Promise<void>;
  planOutfit: (
    outfit: GroundedOutfit,
    date: string,
    occasionName: string,
    notes?: string
  ) => Promise<boolean>;
  confirmWorn: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const usePlannerStore = create<PlannerState>((set, get) => ({
  events: [
    {
      _id: 'event_01',
      date: getTodayStr(),
      occasionName: 'University Semester Presentation',
      isWornConfirmed: false,
      hasLaundryConflict: false,
      conflictingItems: [],
      notes: 'Morning session. Wear comfortable natural cotton.',
      outfitId: {
        _id: 'look_01',
        title: 'Minimalist Campus Monochrome',
        occasion: 'University',
        rationale:
          'Breathable Black Mandarin Shirt paired with Raw Indigo Jeans gives a relaxed yet put-together silhouette. Tan penny loafers elevate the look.',
        items: [
          {
            clothingItemId: 'item_01',
            role: 'TOP',
            name: 'Minimal Black Mandarin Shirt',
            category: 'TOPS',
            subcategory: 'Shirt',
            color: 'Charcoal Black',
            imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
            brand: 'Aarong Man',
          },
          {
            clothingItemId: 'item_02',
            role: 'BOTTOM',
            name: 'Raw Indigo Selvedge Jeans',
            category: 'BOTTOMS',
            subcategory: 'Jeans',
            color: 'Dark Indigo',
            imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600',
            brand: 'Sailor Denim Lab',
          },
          {
            clothingItemId: 'item_04',
            role: 'SHOES',
            name: 'Tan Leather Penny Loafers',
            category: 'FOOTWEAR',
            subcategory: 'Loafers',
            color: 'Tan Brown',
            imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600',
            brand: 'Apex Royal',
          },
        ],
      },
    },
  ],
  selectedDate: getTodayStr(),
  isLoading: false,

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/planner');
      if (res.data?.data && res.data.data.length > 0) {
        set({ events: res.data.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },

  planOutfit: async (outfit, date, occasionName, notes) => {
    const newEvent: CalendarEvent = {
      _id: 'event_' + Date.now().toString(),
      outfitId: outfit,
      date,
      occasionName,
      isWornConfirmed: false,
      notes,
    };

    set((state) => ({ events: [...state.events, newEvent] }));

    try {
      await api.post('/planner', {
        outfitId: outfit._id,
        date,
        occasionName,
        notes,
      });
    } catch (e) {}

    return true;
  },

  confirmWorn: async (eventId: string) => {
    const event = get().events.find((e) => e._id === eventId);
    if (!event) return;

    set((state) => ({
      events: state.events.map((e) =>
        e._id === eventId ? { ...e, isWornConfirmed: true } : e
      ),
    }));

    // Update wear count on local wardrobe store items
    const outfit = event.outfitId;
    if (outfit && Array.isArray(outfit.items)) {
      const wardrobe = useWardrobeStore.getState();
      for (const item of outfit.items) {
        const existing = wardrobe.items.find((i) => i._id === item.clothingItemId);
        if (existing) {
          wardrobe.updateItem(item.clothingItemId, {
            timesWorn: (existing.timesWorn || 0) + 1,
            lastWornDate: new Date().toISOString(),
          });
        }
      }
    }

    try {
      await api.patch(`/planner/${eventId}/confirm-worn`, {});
    } catch (e) {}
  },

  deleteEvent: async (eventId: string) => {
    set((state) => ({
      events: state.events.filter((e) => e._id !== eventId),
    }));

    try {
      await api.delete(`/planner/${eventId}`);
    } catch (e) {}
  },
}));
