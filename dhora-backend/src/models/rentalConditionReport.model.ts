import { Schema, model, Document, Types } from 'mongoose';

export type ConditionStage = 'PRE_RENTAL_DISPATCH' | 'POST_RENTAL_RETURN';

export interface IRentalConditionReport extends Document {
  bookingId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  stage: ConditionStage;
  photos: string[];
  notes: string;
  conditionStatus: 'EXCELLENT' | 'MINOR_WEAR' | 'DAMAGED';
  reportedAt: Date;
}

const RentalConditionReportSchema = new Schema<IRentalConditionReport>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'RentalBooking',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stage: {
      type: String,
      enum: ['PRE_RENTAL_DISPATCH', 'POST_RENTAL_RETURN'],
      required: true,
    },
    photos: {
      type: [String],
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    conditionStatus: {
      type: String,
      enum: ['EXCELLENT', 'MINOR_WEAR', 'DAMAGED'],
      default: 'EXCELLENT',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: 'reportedAt', updatedAt: false } }
);

export const RentalConditionReport = model<IRentalConditionReport>(
  'RentalConditionReport',
  RentalConditionReportSchema
);
