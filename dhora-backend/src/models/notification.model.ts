import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'WEATHER_ALERT'
  | 'RENTAL_UPDATE'
  | 'COMMUNITY_BUY'
  | 'STYLING_TIP'
  | 'PRICE_DROP'
  | 'CALENDAR_REMINDER';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'WEATHER_ALERT',
        'RENTAL_UPDATE',
        'COMMUNITY_BUY',
        'STYLING_TIP',
        'PRICE_DROP',
        'CALENDAR_REMINDER',
      ],
      default: 'STYLING_TIP',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
