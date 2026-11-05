export interface OutfitItemPopulated {
  clothingItemId: string;
  role: 'TOP' | 'BOTTOM' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY';
  name: string;
  category: string;
  subcategory: string;
  color: string;
  imageUrl: string;
  brand?: string;
}

export interface GroundedOutfit {
  _id?: string;
  title: string;
  occasion: string;
  rationale: string;
  season?: string;
  items: OutfitItemPopulated[];
  isFavorite?: boolean;
  modelImageUrl?: string;
  femaleModelImageUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  outfit?: GroundedOutfit;
  createdAt: string;
}

export interface WeatherInfo {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  rainProbability: number;
  recommendationHint: string;
}
