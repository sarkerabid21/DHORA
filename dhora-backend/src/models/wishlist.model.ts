import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  productName: string;
  productUrl?: string;
  imageUrl: string;
  estimatedPrice?: number;
  category: string;
  primaryColor?: string;
  compatibilityScore: number;
  recommendationBadge:
    | 'Fits Your Wardrobe'
    | 'Similar Item Already Exists'
    | 'Limited Combinations'
    | 'More Information Needed';
  newCombinationsCount: number;
  similarItemNames: string[];
  stylingRationale: string;
  notes?: string;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
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
    imageUrl: {
      type: String,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    primaryColor: {
      type: String,
    },
    compatibilityScore: {
      type: Number,
      default: 85,
    },
    recommendationBadge: {
      type: String,
      enum: [
        'Fits Your Wardrobe',
        'Similar Item Already Exists',
        'Limited Combinations',
        'More Information Needed',
      ],
      default: 'Fits Your Wardrobe',
    },
    newCombinationsCount: {
      type: Number,
      default: 3,
    },
    similarItemNames: [String],
    stylingRationale: {
      type: String,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
