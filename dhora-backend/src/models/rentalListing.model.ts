import { Schema, model, Document, Types } from 'mongoose';

export type RentalCondition = 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD';
export type RentalStatus = 'AVAILABLE' | 'RENTED' | 'PAUSED';

export interface IRentalListing extends Document {
  ownerId: Types.ObjectId;
  clothingItemId?: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: RentalCondition;
  dailyRentalPrice: number;
  securityDeposit: number;
  minRentalDays: number;
  maxRentalDays: number;
  locationArea: string;
  pickupAddressInstruction: string;
  images: string[];
  status: RentalStatus;
  rating: number;
  reviewsCount: number;
  rentalPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RentalListingSchema = new Schema<IRentalListing>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clothingItemId: {
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    size: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ['BRAND_NEW', 'LIKE_NEW', 'GOOD'],
      default: 'LIKE_NEW',
    },
    dailyRentalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    minRentalDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxRentalDays: {
      type: Number,
      default: 14,
    },
    locationArea: {
      type: String,
      required: true,
      index: true,
    },
    pickupAddressInstruction: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RENTED', 'PAUSED'],
      default: 'AVAILABLE',
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    rentalPolicy: {
      type: String,
      default:
        'Please return in original condition. Security deposit refunded within 24 hours after return inspection.',
    },
  },
  { timestamps: true }
);

RentalListingSchema.index({ category: 1, dailyRentalPrice: 1, status: 1 });

export const RentalListing = model<IRentalListing>(
  'RentalListing',
  RentalListingSchema
);
