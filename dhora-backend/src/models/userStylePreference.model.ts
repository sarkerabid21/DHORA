import { Schema, model, Document, Types } from 'mongoose';

export interface IUserStylePreference extends Document {
  userId: Types.ObjectId;
  preferredCategories: string[];
  preferredColors: string[];
  avoidedColors: string[];
  styleAesthetic: string[];
  occasions: string[];
  fitPreference: 'SLIM' | 'REGULAR' | 'OVERSIZED' | 'COMFORT';
  createdAt: Date;
  updatedAt: Date;
}

const UserStylePreferenceSchema = new Schema<IUserStylePreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredCategories: {
      type: [String],
      default: ['Tops', 'Pants', 'T-Shirts'],
    },
    preferredColors: {
      type: [String],
      default: ['Black', 'White', 'Navy Blue', 'Beige'],
    },
    avoidedColors: {
      type: [String],
      default: [],
    },
    styleAesthetic: {
      type: [String],
      default: ['Minimalist', 'Smart Casual'],
    },
    occasions: {
      type: [String],
      default: ['Daily Casual', 'University', 'Office'],
    },
    fitPreference: {
      type: String,
      enum: ['SLIM', 'REGULAR', 'OVERSIZED', 'COMFORT'],
      default: 'REGULAR',
    },
  },
  {
    timestamps: true,
  }
);

export const UserStylePreference = model<IUserStylePreference>(
  'UserStylePreference',
  UserStylePreferenceSchema
);
