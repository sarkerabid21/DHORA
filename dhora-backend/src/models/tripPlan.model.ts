import { Schema, model, Document, Types } from 'mongoose';

export interface ITripPlan extends Document {
  userId: Types.ObjectId;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  activities: string[];
  forecastSummary?: string;
  packedClothingItemIds: Types.ObjectId[];
  plannedOutfits: {
    dayNumber: number;
    activity: string;
    outfitTitle: string;
    itemIds: Types.ObjectId[];
  }[];
  missingCategories: string[];
  reusableItemsNotes?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TripPlanSchema = new Schema<ITripPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    activities: {
      type: [String],
      default: ['Sightseeing', 'Casual Dinners'],
    },
    forecastSummary: {
      type: String,
    },
    packedClothingItemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ClothingItem',
      },
    ],
    plannedOutfits: [
      {
        dayNumber: Number,
        activity: String,
        outfitTitle: String,
        itemIds: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
      },
    ],
    missingCategories: [String],
    reusableItemsNotes: String,
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TripPlan = model<ITripPlan>('TripPlan', TripPlanSchema);
