import { Schema, model, Document, Types } from 'mongoose';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'OUT_FOR_DELIVERY'
  | 'ACTIVE'
  | 'RETURN_REQUESTED'
  | 'UNDER_INSPECTION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface IRentalBooking extends Document {
  listingId: Types.ObjectId;
  renterId: Types.ObjectId;
  ownerId: Types.ObjectId;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  rentalFee: number;
  depositFee: number;
  totalAmount: number;
  status: BookingStatus;
  deliveryMethod: 'PICKUP' | 'COURIER';
  renterNotes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RentalBookingSchema = new Schema<IRentalBooking>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'RentalListing',
      required: true,
      index: true,
    },
    renterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    rentalFee: {
      type: Number,
      required: true,
    },
    depositFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'OUT_FOR_DELIVERY',
        'ACTIVE',
        'RETURN_REQUESTED',
        'UNDER_INSPECTION',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED',
      ],
      default: 'PENDING',
      index: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['PICKUP', 'COURIER'],
      default: 'PICKUP',
    },
    renterNotes: String,
    cancellationReason: String,
  },
  { timestamps: true }
);

export const RentalBooking = model<IRentalBooking>(
  'RentalBooking',
  RentalBookingSchema
);
