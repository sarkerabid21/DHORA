import { Schema, model, Document, Types } from 'mongoose';

export interface IOutfitCalendar extends Document {
  userId: Types.ObjectId;
  outfitId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  occasionName: string;
  reminderTime?: Date;
  isWornConfirmed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitCalendarSchema = new Schema<IOutfitCalendar>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    outfitId: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true, // e.g. "2026-11-05"
    },
    occasionName: {
      type: String,
      required: true,
      trim: true,
    },
    reminderTime: {
      type: Date,
    },
    isWornConfirmed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

OutfitCalendarSchema.index({ userId: 1, date: 1 });

export const OutfitCalendar = model<IOutfitCalendar>(
  'OutfitCalendar',
  OutfitCalendarSchema
);
