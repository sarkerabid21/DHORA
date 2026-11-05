import { Schema, model, Document, Types } from 'mongoose';

export interface ICommunityBuyComment extends Document {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  parentCommentId?: Types.ObjectId;
  content: string;
  likesCount: number;
  isCreatorReply: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityBuyCommentSchema = new Schema<ICommunityBuyComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityBuyPost',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityBuyComment',
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    isCreatorReply: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

CommunityBuyCommentSchema.index({ postId: 1, createdAt: 1 });

export const CommunityBuyComment = model<ICommunityBuyComment>(
  'CommunityBuyComment',
  CommunityBuyCommentSchema
);
