import { Schema, model, Document, Types } from 'mongoose';

export interface IOutfitFeedback extends Document {
  outfitId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: 'LIKE' | 'DISLIKE';
  feedbackReason?: 'COLOR_MISMATCH' | 'WEATHER_UNSUITABLE' | 'NOT_MY_STYLE' | 'PERFECT' | 'OTHER';
  comment?: string;
  createdAt: Date;
}

const OutfitFeedbackSchema = new Schema<IOutfitFeedback>(
  {
    outfitId: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: String,
      enum: ['LIKE', 'DISLIKE'],
      required: true,
    },
    feedbackReason: {
      type: String,
      enum: ['COLOR_MISMATCH', 'WEATHER_UNSUITABLE', 'NOT_MY_STYLE', 'PERFECT', 'OTHER'],
    },
    comment: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const OutfitFeedback = model<IOutfitFeedback>(
  'OutfitFeedback',
  OutfitFeedbackSchema
);
