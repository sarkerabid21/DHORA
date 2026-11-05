import { Schema, model, Document, Types } from 'mongoose';

export interface IAIMessage {
  sender: 'USER' | 'ASSISTANT';
  text: string;
  suggestedOutfitId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  userId: Types.ObjectId;
  title: string;
  context: 'GENERAL_STYLING' | 'EVENT_PLANNING' | 'WEATHER_ASSIST';
  messages: IAIMessage[];
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    sender: {
      type: String,
      enum: ['USER', 'ASSISTANT'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    suggestedOutfitId: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Styling Session',
    },
    context: {
      type: String,
      enum: ['GENERAL_STYLING', 'EVENT_PLANNING', 'WEATHER_ASSIST'],
      default: 'GENERAL_STYLING',
    },
    messages: [AIMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AIConversation = model<IAIConversation>(
  'AIConversation',
  AIConversationSchema
);
