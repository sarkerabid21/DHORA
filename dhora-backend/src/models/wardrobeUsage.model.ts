import { Schema, model, Document, Types } from 'mongoose';

export interface IWardrobeUsage extends Document {
  userId: Types.ObjectId;
  clothingItemId: Types.ObjectId;
  outfitId?: Types.ObjectId;
  dateWorn: string; // YYYY-MM-DD
  occasion?: string;
  notes?: string;
  createdAt: Date;
}

const WardrobeUsageSchema = new Schema<IWardrobeUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clothingItemId: {
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
      required: true,
      index: true,
    },
    outfitId: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
    },
    dateWorn: {
      type: String,
      required: true,
      index: true,
    },
    occasion: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

WardrobeUsageSchema.index({ userId: 1, clothingItemId: 1, dateWorn: 1 });

export const WardrobeUsage = model<IWardrobeUsage>(
  'WardrobeUsage',
  WardrobeUsageSchema
);
