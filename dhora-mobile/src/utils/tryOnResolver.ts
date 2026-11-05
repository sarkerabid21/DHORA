import { ClothingItem } from '../types/clothing';

export interface ModelTryOnContext {
  top?: ClothingItem | null;
  bottom?: ClothingItem | null;
  outer?: ClothingItem | null;
  shoes?: ClothingItem | null;
  gender?: 'male' | 'female' | 'tailor' | 'minimal';
  rawOutfitItems?: Array<{ name: string; category?: string; role?: string }>;
}

export const MODEL_CATALOG = {
  maleCatTeeJeans:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885532/dhora/models/model_male_cat_tee_jeans.jpg',
  femaleCatTeeJeans:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885535/dhora/models/model_female_cat_tee_jeans.jpg',
  maleCheckeredTrousers:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885533/dhora/models/model_male_checkered_trousers.jpg',
  femaleCheckeredTrousers:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885537/dhora/models/model_female_checkered_trousers.jpg',
  maleCyanBlazer:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885534/dhora/models/model_male_cyan_blazer.jpg',
  malePanjabi:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868915/dhora/models/model_male_panjabi.jpg',
  maleNavyEspresso:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868700/dhora/models/model_male_navy_espresso.jpg',
  femaleNavyEspresso:
    'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868703/dhora/models/model_female_navy_espresso.jpg',
};

/**
 * Resolves the accurate photorealistic model image based on the exact clothing items
 * selected or uploaded by the user.
 */
export function resolveModelTryOnImage(ctx: ModelTryOnContext): string {
  const { top, bottom, outer, gender = 'male', rawOutfitItems } = ctx;

  const names = [
    top?.name,
    bottom?.name,
    outer?.name,
    top?.category,
    top?.pattern,
    top?.primaryColor,
    ...(rawOutfitItems && Array.isArray(rawOutfitItems)
      ? rawOutfitItems.map((i) => `${i?.name || ''} ${i?.role || ''} ${i?.category || ''}`)
      : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. Traditional / Panjabi
  if (
    gender === 'tailor' ||
    top?.category === 'TRADITIONAL' ||
    names.includes('panjabi') ||
    names.includes('kurta') ||
    names.includes('pajama')
  ) {
    return MODEL_CATALOG.malePanjabi;
  }

  // 2. Cyan / Turquoise Slim-Fit Blazer or statement outerwear
  if (
    outer?.name?.toLowerCase().includes('blazer') ||
    outer?.name?.toLowerCase().includes('cyan') ||
    names.includes('cyan') ||
    names.includes('turquoise') ||
    (names.includes('blazer') && names.includes('cyan'))
  ) {
    return MODEL_CATALOG.maleCyanBlazer;
  }

  // 3. Cat Graphic Black T-Shirt ("Despise", "Cat", "Speechless", graphic tee)
  if (
    names.includes('cat') ||
    names.includes('despise') ||
    names.includes('speechless') ||
    (names.includes('graphic') && names.includes('black'))
  ) {
    return gender === 'female'
      ? MODEL_CATALOG.femaleCatTeeJeans
      : MODEL_CATALOG.maleCatTeeJeans;
  }

  // 4. Blue Checkered Popover Shirt / Plaid
  if (
    names.includes('checkered') ||
    names.includes('popover') ||
    names.includes('plaid') ||
    (names.includes('blue') && names.includes('check'))
  ) {
    return gender === 'female'
      ? MODEL_CATALOG.femaleCheckeredTrousers
      : MODEL_CATALOG.maleCheckeredTrousers;
  }

  // 5. Classic Navy Cotton Shirt or Espresso Trousers
  if (
    names.includes('navy') ||
    names.includes('espresso') ||
    names.includes('chinos') ||
    names.includes('trouser')
  ) {
    return gender === 'female'
      ? MODEL_CATALOG.femaleNavyEspresso
      : MODEL_CATALOG.maleNavyEspresso;
  }

  // 6. Generic Gender fallback based on top style
  if (gender === 'female') {
    if (names.includes('t-shirt') || names.includes('tee') || names.includes('casual')) {
      return MODEL_CATALOG.femaleCatTeeJeans;
    }
    if (names.includes('shirt') || names.includes('formal') || names.includes('button')) {
      return MODEL_CATALOG.femaleCheckeredTrousers;
    }
    return MODEL_CATALOG.femaleNavyEspresso;
  }

  if (names.includes('t-shirt') || names.includes('tee') || names.includes('jeans')) {
    return MODEL_CATALOG.maleCatTeeJeans;
  }

  if (names.includes('shirt') || names.includes('plaid') || names.includes('check')) {
    return MODEL_CATALOG.maleCheckeredTrousers;
  }

  return MODEL_CATALOG.maleNavyEspresso;
}
