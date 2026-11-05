import { Schema, model, Document, Types } from 'mongoose';

export type CommunityBuyStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'ORDER_CLOSED'
  | 'CONFIRMED_BY_CREATOR'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ICommunityBuyPost extends Document {
  creatorId: Types.ObjectId;
  productName: string;
  productUrl?: string;
  productImageUrl: string;
  unitPrice: number;
  deliverySavingPerPerson: number;
  targetArea: string;
  publicPickupLocation: string;
  pickupInstructions?: string;
  availableSizes: string[];
  availableColors: string[];
  closingAt: Date;
  status: CommunityBuyStatus;
  maxParticipants: number;
  minParticipantsRequired: number;
  confirmedOrdersCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityBuyPostSchema = new Schema<ICommunityBuyPost>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productUrl: {
      type: String,
      trim: true,
    },
    productImageUrl: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliverySavingPerPerson: {
      type: Number,
      default: 120,
    },
    targetArea: {
      type: String,
      required: true,
      index: true,
    },
    publicPickupLocation: {
      type: String,
      required: true, // Must be safe public point, never home address
    },
    pickupInstructions: {
      type: String,
      default: 'Meet at agreed public venue. Present your collection code to claim.',
    },
    availableSizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    availableColors: {
      type: [String],
      default: ['Black', 'Navy', 'Grey'],
    },
    closingAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'CLOSING_SOON',
        'ORDER_CLOSED',
        'CONFIRMED_BY_CREATOR',
        'PROCESSING',
        'READY_FOR_PICKUP',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'OPEN',
      index: true,
    },
    maxParticipants: {
      type: Number,
      default: 8,
    },
    minParticipantsRequired: {
      type: Number,
      default: 3,
    },
    confirmedOrdersCount: {
      type: Number,
      default: 1,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CommunityBuyPostSchema.index({ targetArea: 1, closingAt: 1, status: 1 });

export const CommunityBuyPost = model<ICommunityBuyPost>(
  'CommunityBuyPost',
  CommunityBuyPostSchema
);
