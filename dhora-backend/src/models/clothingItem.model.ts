import { Schema, model, Document, Types } from 'mongoose';

export type ClothingCategory =
  | 'TOPS'
  | 'BOTTOMS'
  | 'DRESSES'
  | 'OUTERWEAR'
  | 'FOOTWEAR'
  | 'ACCESSORIES'
  | 'TRADITIONAL';

export type ClothingStatus = 'AVAILABLE' | 'IN_LAUNDRY' | 'UNAVAILABLE' | 'ARCHIVED';

export interface IClothingItem extends Document {
  userId: Types.ObjectId;
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
  purchaseDate?: Date;
  status: ClothingStatus;
  isFavorite: boolean;
  timesWorn: number;
  lastWornDate?: Date;
  imageUrl: string;
  cleanedImageUrl?: string;
  aiAttributes?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema = new Schema<IClothingItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'TOPS',
        'BOTTOMS',
        'DRESSES',
        'OUTERWEAR',
        'FOOTWEAR',
        'ACCESSORIES',
        'TRADITIONAL',
      ],
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    primaryColor: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryColors: {
      type: [String],
      default: [],
    },
    pattern: {
      type: String,
      default: 'Solid',
      trim: true,
    },
    fabric: {
      type: String,
      trim: true,
    },
    seasonality: {
      type: String,
      enum: ['SUMMER', 'WINTER', 'MONSOON', 'ALL_SEASON'],
      default: 'ALL_SEASON',
    },
    brand: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    purchaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_LAUNDRY', 'UNAVAILABLE', 'ARCHIVED'],
      default: 'AVAILABLE',
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    timesWorn: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWornDate: {
      type: Date,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cleanedImageUrl: {
      type: String,
    },
    aiAttributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user closet queries
ClothingItemSchema.index({ userId: 1, category: 1, status: 1 });
ClothingItemSchema.index({ userId: 1, isFavorite: 1 });

export const ClothingItem = model<IClothingItem>(
  'ClothingItem',
  ClothingItemSchema
);
