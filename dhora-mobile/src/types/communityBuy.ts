export type GroupBuyStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'ORDER_CLOSED'
  | 'ORDER_PLACED_WITH_SELLER'
  | 'PARCEL_SHIPPED'
  | 'PARCEL_ARRIVED'
  | 'READY_FOR_PICKUP'
  | 'ALL_COLLECTED'
  | 'CANCELLED';

export interface CommunityBuyPost {
  _id: string;
  creatorId: string | { _id: string; email: string };
  productName: string;
  productUrl?: string;
  productImageUrl: string;
  unitPrice: number;
  deliverySavingPerPerson: number;
  targetArea: string;
  publicPickupLocation: string;
  pickupInstructions?: string;
  availableSizes: string[];
  availableColors: string[];
  closingAt: string;
  status: GroupBuyStatus;
  maxParticipants: number;
  minParticipantsRequired: number;
  confirmedOrdersCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CommunityBuyOrder {
  _id: string;
  postId: string | CommunityBuyPost;
  participantId: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  contactPhone: string;
  pickupUniqueCode: string;
  status: 'PLACED' | 'PAID' | 'READY' | 'COLLECTED' | 'CANCELLED';
  collectedAt?: string;
  createdAt: string;
}

export interface CommunityBuyComment {
  _id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentCommentId?: string | null;
  content: string;
  likesCount: number;
  isCreatorReply: boolean;
  createdAt: string;
}
