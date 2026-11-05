import { Schema, model, Document, Types } from 'mongoose';

export type ParticipantOrderStatus =
  | 'PLACED'
  | 'PAID'
  | 'READY'
  | 'COLLECTED'
  | 'CANCELLED';

export interface ICommunityBuyOrder extends Document {
  postId: Types.ObjectId;
  participantId: Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  contactPhone: string;
  pickupUniqueCode: string;
  status: ParticipantOrderStatus;
  collectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityBuyOrderSchema = new Schema<ICommunityBuyOrder>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityBuyPost',
      required: true,
      index: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    pickupUniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true, // e.g. "DHR-9482-K"
    },
    status: {
      type: String,
      enum: ['PLACED', 'PAID', 'READY', 'COLLECTED', 'CANCELLED'],
      default: 'PLACED',
      index: true,
    },
    collectedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const CommunityBuyOrder = model<ICommunityBuyOrder>(
  'CommunityBuyOrder',
  CommunityBuyOrderSchema
);
