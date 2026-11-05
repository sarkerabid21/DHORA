import { Schema, model, Document, Types } from 'mongoose';

export interface IOutfitItemSubdoc {
  clothingItemId: Types.ObjectId;
  role: 'TOP' | 'BOTTOM' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY';
}

export interface IOutfit extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  occasion: string;
  season?: string;
  weatherSuitability?: {
    minTemp?: number;
    maxTemp?: number;
    rainSafe?: boolean;
    conditionMatch?: string;
  };
  items: IOutfitItemSubdoc[];
  rationale: string;
  isAiGenerated: boolean;
  isFavorite: boolean;
  previewImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitItemSubdocSchema = new Schema<IOutfitItemSubdoc>(
  {
    clothingItemId: {
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
      required: true,
    },
    role: {
      type: String,
      enum: ['TOP', 'BOTTOM', 'OUTERWEAR', 'SHOES', 'ACCESSORY'],
      required: true,
    },
  },
  { _id: false }
);

const OutfitSchema = new Schema<IOutfit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    season: {
      type: String,
      default: 'ALL',
    },
    weatherSuitability: {
      minTemp: { type: Number },
      maxTemp: { type: Number },
      rainSafe: { type: Boolean, default: true },
      conditionMatch: { type: String },
    },
    items: [OutfitItemSubdocSchema],
    rationale: {
      type: String,
      required: true,
    },
    isAiGenerated: {
      type: Boolean,
      default: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    previewImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OutfitSchema.index({ userId: 1, occasion: 1 });
OutfitSchema.index({ userId: 1, isFavorite: 1 });

export const Outfit = model<IOutfit>('Outfit', OutfitSchema);
