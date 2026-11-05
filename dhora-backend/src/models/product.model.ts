import { Schema, model, Document, Types } from 'mongoose';

export interface IMerchant extends Document {
  name: string;
  logoUrl?: string;
  websiteUrl: string;
  contactEmail: string;
  isVerified: boolean;
  rating: number;
}

const MerchantSchema = new Schema<IMerchant>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    websiteUrl: { type: String, required: true },
    contactEmail: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
  },
  { timestamps: true }
);

export const Merchant = model<IMerchant>('Merchant', MerchantSchema);

export interface IProduct extends Document {
  merchantId?: Types.ObjectId;
  merchantName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  currency: string;
  images: string[];
  affiliateUrl: string;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
    },
    merchantName: {
      type: String,
      required: true,
      default: 'Curated Brand',
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    images: {
      type: [String],
      required: true,
    },
    affiliateUrl: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, price: 1 });

export const Product = model<IProduct>('Product', ProductSchema);
