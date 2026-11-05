import { create } from 'zustand';
import { api } from '../services/api';
import { ProductItem } from '../types/marketplace';

const CURATED_SEED_PRODUCTS: ProductItem[] = [
  {
    _id: 'prod_01',
    merchantName: 'Aarong',
    title: 'Aarong Embroidered Fine Cotton Kurta',
    description:
      'Heritage Bangladeshi design featuring delicate Kantha stitch embroidery on lightweight pure cotton.',
    category: 'TRADITIONAL',
    price: 3600,
    discountPrice: 3200,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'],
    affiliateUrl: 'https://aarong.com/men/panjabi',
    inStock: true,
    tags: ['Festive', 'Traditional', 'Summer'],
  },
  {
    _id: 'prod_02',
    merchantName: 'Sailor',
    title: 'Sailor Raw Japanese Selvedge Denim',
    description:
      '13.5oz premium Japanese raw selvedge denim woven on vintage shuttle looms. Slim tapered fit.',
    category: 'BOTTOMS',
    price: 3200,
    discountPrice: 2850,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=600'],
    affiliateUrl: 'https://sailor.clothing/denim',
    inStock: true,
    tags: ['Staple', 'Selvedge', 'Streetwear'],
  },
  {
    _id: 'prod_03',
    merchantName: 'Taaga',
    title: 'Taaga Contemporary Block Print Kaftan',
    description:
      'Relaxed modern silhouette with traditional hand-block geometric printing on breathable modal fabric.',
    category: 'DRESSES',
    price: 2450,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'],
    affiliateUrl: 'https://aarong.com/taaga',
    inStock: true,
    tags: ['Contemporary', 'Casual'],
  },
  {
    _id: 'prod_04',
    merchantName: 'Klothe',
    title: 'Klothe 240 GSM Heavyweight Streetwear Hoodie',
    description:
      'Minimalist boxy drop-shoulder cut crafted from ultra-soft combed fleece cotton.',
    category: 'OUTERWEAR',
    price: 1950,
    discountPrice: 1650,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'],
    affiliateUrl: 'https://klothe.com/hoodies',
    inStock: true,
    tags: ['Streetwear', 'Winter', 'Oversized'],
  },
  {
    _id: 'prod_05',
    merchantName: 'Apex Royal',
    title: 'Apex Royal Hand-Finished Penny Loafers',
    description:
      'Full-grain Italian calf leather upper with Blake stitched leather sole and cushioned arch support.',
    category: 'FOOTWEAR',
    price: 5200,
    discountPrice: 4800,
    currency: 'BDT',
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600'],
    affiliateUrl: 'https://apexfootwear.com/men/formal',
    inStock: true,
    tags: ['Formal', 'Smart Casual', 'Leather'],
  },
];

interface ShoppingState {
  products: ProductItem[];
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;

  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  fetchProducts: () => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  products: CURATED_SEED_PRODUCTS,
  selectedCategory: 'ALL',
  searchQuery: '',
  isLoading: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/shopping');
      if (res.data?.data && res.data.data.length > 0) {
        set({ products: res.data.data, isLoading: false });
        return;
      }
    } catch (e) {}
    set({ isLoading: false });
  },
}));
