import { create } from 'zustand';
import { api } from '../services/api';
import { useWardrobeStore } from './wardrobeStore';

export interface BeforeYouBuyAnalysis {
  productName: string;
  productUrl?: string;
  imageUrl: string;
  category: string;
  primaryColor?: string;
  estimatedPrice?: number;
  compatibilityScore: number;
  recommendationBadge:
    | 'Fits Your Wardrobe'
    | 'Similar Item Already Exists'
    | 'Limited Combinations'
    | 'More Information Needed'
    | 'High-Versatility Staple';
  verdict?: 'BUY' | 'CONSIDER_ALTERNATIVE' | 'SKIP_DUPLICATE';
  aiValuableComment?: string;
  newCombinationsCount: number;
  similarItemNames: string[];
  stylingRationale: string;
  compatibleItemsSample: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
  }[];
}

export interface WishlistItem extends BeforeYouBuyAnalysis {
  _id: string;
  createdAt: string;
}

interface BeforeYouBuyState {
  currentAnalysis: BeforeYouBuyAnalysis | null;
  wishlist: WishlistItem[];
  isAnalyzing: boolean;

  analyzeProduct: (params: {
    productName: string;
    productUrl?: string;
    imageUrl: string;
    category?: string;
    primaryColor?: string;
    price?: number;
  }) => Promise<BeforeYouBuyAnalysis>;
  saveCurrentToWishlist: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
}

export const useBeforeYouBuyStore = create<BeforeYouBuyState>((set, get) => ({
  currentAnalysis: null,
  wishlist: [],
  isAnalyzing: false,

  analyzeProduct: async (params) => {
    set({ isAnalyzing: true });
    try {
      const res = await api.post('/before-you-buy/analyze', params);
      const data: BeforeYouBuyAnalysis = res.data.data;
      set({ currentAnalysis: data, isAnalyzing: false });
      return data;
    } catch (e) {
      // Offline fallback computation against local wardrobe
      const items = useWardrobeStore.getState().items;
      const targetCat = (params.category || 'TOPS').toUpperCase();
      const targetCol = (params.primaryColor || 'Neutral').toLowerCase();

      const similar = items.filter(
        (i) =>
          i.category === targetCat &&
          i.primaryColor.toLowerCase().includes(targetCol)
      );

      const counterparts = items.filter((i) =>
        targetCat === 'TOPS' ? i.category === 'BOTTOMS' : i.category === 'TOPS'
      );

      const hasDuplicate = similar.length > 0;
      const verdict: 'BUY' | 'CONSIDER_ALTERNATIVE' | 'SKIP_DUPLICATE' = hasDuplicate
        ? 'SKIP_DUPLICATE'
        : counterparts.length === 0
        ? 'CONSIDER_ALTERNATIVE'
        : 'BUY';

      const badge = hasDuplicate
        ? 'Similar Item Already Exists'
        : counterparts.length === 0
        ? 'Limited Combinations'
        : 'Fits Your Wardrobe';

      const score = hasDuplicate ? 58 : Math.min(78 + counterparts.length * 5, 96);
      const newCombos = Math.min(counterparts.length * 2, 6);

      const aiValuableComment = hasDuplicate
        ? `Apnar closet-e already similar "${similar[0].name}" ache! Duplicate na kine onno kono missing color ba staple kinle closet aro versatile hobe.`
        : counterparts.length > 0
        ? `Darun choice! Eita apnar closet-er ${counterparts[0].name}-er shathe khub shundor pair hobe ebong pray ${newCombos} ta notun outfit create korbe.`
        : `Eita kinte paren, tobe apnar closet-e matching pieces kom thakay eta versatile bhabe wear kora ektu tough hote pare.`;

      const fallback: BeforeYouBuyAnalysis = {
        productName: params.productName,
        productUrl: params.productUrl,
        imageUrl: params.imageUrl,
        category: targetCat,
        primaryColor: params.primaryColor,
        estimatedPrice: params.price,
        compatibilityScore: score,
        recommendationBadge: badge,
        verdict,
        newCombinationsCount: newCombos,
        similarItemNames: similar.map((i) => i.name),
        aiValuableComment,
        stylingRationale: hasDuplicate
          ? `You already own ${similar[0].name}. Buying this may create closet duplication without expanding your outfits.`
          : `This piece complements your existing bottoms and footwear, yielding at least ${newCombos} new combinations.`,
        compatibleItemsSample: counterparts.slice(0, 3).map((i) => ({
          id: i._id,
          name: i.name,
          category: i.category,
          imageUrl: i.imageUrl,
        })),
      };

      set({ currentAnalysis: fallback, isAnalyzing: false });
      return fallback;
    }
  },

  saveCurrentToWishlist: async () => {
    const analysis = get().currentAnalysis;
    if (!analysis) return;

    const wishlistItem: WishlistItem = {
      ...analysis,
      _id: 'wish_' + Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ wishlist: [wishlistItem, ...state.wishlist] }));

    try {
      await api.post('/before-you-buy/wishlist', analysis);
    } catch (e) {}
  },

  fetchWishlist: async () => {
    try {
      const res = await api.get('/before-you-buy/wishlist');
      if (res.data?.data) {
        set({ wishlist: res.data.data });
      }
    } catch (e) {}
  },

  removeFromWishlist: async (id: string) => {
    set((state) => ({
      wishlist: state.wishlist.filter((w) => w._id !== id),
    }));

    try {
      await api.delete(`/before-you-buy/wishlist/${id}`);
    } catch (e) {}
  },
}));
