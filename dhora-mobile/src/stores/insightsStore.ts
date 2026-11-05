import { create } from 'zustand';
import { api } from '../services/api';
import { ClothingItem } from '../types/clothing';
import { useWardrobeStore } from './wardrobeStore';

export interface GapRecommendation {
  category: string;
  reason: string;
}

interface InsightsData {
  totalItems: number;
  totalOutfits: number;
  totalClosetValue: number;
  totalWornCount: number;
  avgCostPerWear: number;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
  mostWorn: ClothingItem[];
  underused: ClothingItem[];
  gapRecommendations: GapRecommendation[];
  repetitionAlert: string | null;
}

interface InsightsState {
  data: InsightsData;
  isLoading: boolean;
  fetchInsights: () => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  data: {
    totalItems: 6,
    totalOutfits: 2,
    totalClosetValue: 16900,
    totalWornCount: 50,
    avgCostPerWear: 310,
    categoryCounts: {
      TOPS: 2,
      BOTTOMS: 2,
      TRADITIONAL: 1,
      FOOTWEAR: 1,
    },
    colorCounts: {
      Black: 1,
      Indigo: 1,
      White: 1,
      Tan: 1,
      Olive: 1,
      Khaki: 1,
    },
    mostWorn: [],
    underused: [],
    gapRecommendations: [
      {
        category: 'Layering Piece',
        reason:
          'No lightweight jackets or overshirts registered. An overshirt or structured blazer will multiply your styling possibilities.',
      },
      {
        category: 'Footwear Contrast',
        reason:
          'Consider adding clean white sneakers to contrast with your formal leather penny loafers.',
      },
    ],
    repetitionAlert: null,
  },
  isLoading: false,

  fetchInsights: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/insights/wardrobe');
      if (res.data?.data) {
        set({ data: res.data.data, isLoading: false });
        return;
      }
    } catch (e) {}

    // Fallback calculation from local wardrobeStore items
    const items = useWardrobeStore.getState().items;
    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    let totalValue = 0;
    let totalWorn = 0;

    for (const item of items) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      colorCounts[item.primaryColor] = (colorCounts[item.primaryColor] || 0) + 1;
      totalValue += item.purchasePrice || 0;
      totalWorn += item.timesWorn || 0;
    }

    const itemsWithPrice = items.filter((i) => i.purchasePrice && i.purchasePrice > 0);
    const avgCpw =
      itemsWithPrice.length > 0
        ? Math.round(
            itemsWithPrice.reduce(
              (sum, i) => sum + i.purchasePrice! / Math.max(i.timesWorn, 1),
              0
            ) / itemsWithPrice.length
          )
        : 0;

    const mostWorn = [...items].sort((a, b) => b.timesWorn - a.timesWorn).slice(0, 4);
    const underused = [...items].sort((a, b) => a.timesWorn - b.timesWorn).slice(0, 4);

    set({
      data: {
        totalItems: items.length,
        totalOutfits: 2,
        totalClosetValue: totalValue,
        totalWornCount: totalWorn,
        avgCostPerWear: avgCpw,
        categoryCounts,
        colorCounts,
        mostWorn,
        underused,
        gapRecommendations: [
          {
            category: 'Layering Piece',
            reason:
              'No lightweight jackets or overshirts registered. Adding one will expand your existing tops by 3x.',
          },
          {
            category: 'Footwear Contrast',
            reason:
              'Adding white minimalist sneakers will balance your formal leather loafers for campus and weekend walks.',
          },
        ],
        repetitionAlert: null,
      },
      isLoading: false,
    });
  },
}));
