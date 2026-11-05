import { Schema, model, Document, Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';
  preferredLanguage: 'bn' | 'en';
  locationArea: string;
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  bio?: string;
  pushNotificationTokens: string[];
  preferencesCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'],
    },
    preferredLanguage: {
      type: String,
      enum: ['bn', 'en'],
      default: 'bn',
    },
    locationArea: {
      type: String,
      default: 'Dhaka',
      trim: true,
    },
    locationCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    pushNotificationTokens: [
      {
        type: String,
      },
    ],
    preferencesCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserProfile = model<IUserProfile>('UserProfile', UserProfileSchema);
