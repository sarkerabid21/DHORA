import { create } from 'zustand';
import { api } from '../services/api';
import { useWardrobeStore } from './wardrobeStore';

export interface PlannedTripOutfit {
  dayNumber: number;
  activity: string;
  outfitTitle: string;
  items: {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
  }[];
}

export interface PackedItemSummary {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl: string;
}

export interface TripPlanResult {
  destination: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  forecastSummary: string;
  reusableItemsNotes: string;
  missingCategories: string[];
  packedList: PackedItemSummary[];
  plannedOutfits: PlannedTripOutfit[];
  hasMissingWeatherItems?: boolean;
  missingItemsAdvice?: string;
  missingItemsList?: string[];
  weatherTemperature?: number;
  weatherCondition?: string;
}

interface TripState {
  currentPlan: TripPlanResult | null;
  isLoading: boolean;
  generateTripPlan: (params: {
    destination: string;
    durationDays: number;
    startDate?: string;
    activities?: string[];
  }) => Promise<TripPlanResult>;
}

export const useTripStore = create<TripState>((set) => ({
  currentPlan: null,
  isLoading: false,

  generateTripPlan: async (params) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/trip/plan', params);
      const data = res.data.data;
      const result: TripPlanResult = {
        destination: data.tripPlan.destination,
        durationDays: data.tripPlan.durationDays,
        startDate: data.tripPlan.startDate,
        endDate: data.tripPlan.endDate,
        forecastSummary: data.tripPlan.forecastSummary,
        reusableItemsNotes: data.tripPlan.reusableItemsNotes,
        missingCategories: data.tripPlan.missingCategories || [],
        packedList: data.packedListDetails,
        plannedOutfits: data.plannedOutfitsWithDetails,
        hasMissingWeatherItems: data.hasMissingWeatherItems,
        missingItemsAdvice: data.missingItemsAdvice,
        missingItemsList: data.missingItemsList || [],
        weatherTemperature: data.weatherTemperature,
        weatherCondition: data.weatherCondition,
      };
      set({ currentPlan: result, isLoading: false });
      return result;
    } catch (e) {
      // Offline fallback: capsule generator from wardrobeStore
      const items = useWardrobeStore.getState().items.filter(
        (i) => i.status === 'AVAILABLE'
      );
      const tops = items.filter((i) => i.category === 'TOPS' || i.category === 'TRADITIONAL');
      const bottoms = items.filter((i) => i.category === 'BOTTOMS');
      const shoes = items.filter((i) => i.category === 'FOOTWEAR');

      const packedTops = tops.slice(0, Math.min(tops.length, params.durationDays));
      const packedBottoms = bottoms.slice(0, 2);
      const packedShoes = shoes.slice(0, 1);

      const packedList: PackedItemSummary[] = [
        ...packedTops,
        ...packedBottoms,
        ...packedShoes,
      ].map((i) => ({
        id: i._id,
        name: i.name,
        category: i.category,
        color: i.primaryColor,
        imageUrl: i.imageUrl,
      }));

      const plannedOutfits: PlannedTripOutfit[] = [];
      for (let day = 1; day <= params.durationDays; day++) {
        const top = packedTops[(day - 1) % packedTops.length] || items[0];
        const bottom = packedBottoms[(day - 1) % packedBottoms.length] || items[1] || items[0];
        const shoe = packedShoes[0];

        plannedOutfits.push({
          dayNumber: day,
          activity: `Day ${day} Sightseeing & Dinner in ${params.destination}`,
          outfitTitle: `Day ${day}: ${top.name} + ${bottom.name}`,
          items: [
            { id: top._id, name: top.name, role: 'TOP', imageUrl: top.imageUrl },
            { id: bottom._id, name: bottom.name, role: 'BOTTOM', imageUrl: bottom.imageUrl },
            ...(shoe ? [{ id: shoe._id, name: shoe.name, role: 'SHOES', imageUrl: shoe.imageUrl }] : []),
          ],
        });
      }

      const destLower = params.destination.toLowerCase();
      const isCold =
        destLower.includes('sajek') ||
        destLower.includes('darjeeling') ||
        destLower.includes('bandarban') ||
        destLower.includes('kashmir') ||
        destLower.includes('winter') ||
        destLower.includes('shit') ||
        destLower.includes('thanda') ||
        destLower.includes('hill');

      const hasWarm = items.some(
        (i) =>
          i.category === 'OUTERWEAR' ||
          /jacket|hoodie|sweater|coat|fleece/i.test(i.name)
      );

      const hasMissingWeatherItems = isCold && !hasWarm;
      const missingItemsAdvice = hasMissingWeatherItems
        ? `${params.destination}-e shondha o rate besh shit thakbe (14°C - 16°C). Kintu apnar digital wardrobe-e kono jacket, hoodie ba winter wear nei! Eita na thakle trip-e thanda lagbe. Trip-e jawar agey oboshoy ekta Heavy Fleece Hoodie ba Windbreaker Jacket ar Woolen Socks kine nin ba DHORA Rent theke rent kore nin!`
        : undefined;

      const fallback: TripPlanResult = {
        destination: params.destination,
        durationDays: params.durationDays,
        startDate: params.startDate || '2026-11-10',
        endDate: '2026-11-14',
        forecastSummary: isCold
          ? `Expected chilly 15°C mountain weather in ${params.destination}. Heavy night mist.`
          : `Expected pleasant 28°C travel climate in ${params.destination}.`,
        reusableItemsNotes: `Your ${packedBottoms[0]?.name || 'jeans'} can be worn across multiple days to minimize luggage.`,
        missingCategories: shoes.length === 0 ? ['Travel Walking Shoes'] : [],
        packedList,
        plannedOutfits,
        hasMissingWeatherItems,
        missingItemsAdvice,
        missingItemsList: hasMissingWeatherItems
          ? ['Heavy Fleece Hoodie / Windbreaker Jacket', 'Woolen Socks', 'Thermal Base Layer']
          : [],
        weatherTemperature: isCold ? 15 : 28,
        weatherCondition: isCold ? 'Chilly Mountain Air' : 'Sunny & Warm',
      };

      set({ currentPlan: fallback, isLoading: false });
      return fallback;
    }
  },
}));
