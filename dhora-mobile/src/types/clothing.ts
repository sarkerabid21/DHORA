export type ClothingCategory =
  | 'All'
  | 'TOPS'
  | 'BOTTOMS'
  | 'DRESSES'
  | 'OUTERWEAR'
  | 'FOOTWEAR'
  | 'ACCESSORIES'
  | 'TRADITIONAL';

export type ClothingStatus = 'AVAILABLE' | 'IN_LAUNDRY' | 'UNAVAILABLE';

export interface ClothingItem {
  _id: string;
  userId: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  fabric?: string;
  seasonality: 'SUMMER' | 'WINTER' | 'MONSOON' | 'ALL_SEASON';
  brand?: string;
  size?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  status: ClothingStatus;
  isFavorite: boolean;
  timesWorn: number;
  lastWornDate?: string;
  imageUrl: string;
  cleanedImageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface RecognizedAttributes {
  name: string;
  category: ClothingCategory;
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  fabric: string;
  seasonality: 'SUMMER' | 'WINTER' | 'MONSOON' | 'ALL_SEASON';
  brand?: string;
  formalness?: string;
}
