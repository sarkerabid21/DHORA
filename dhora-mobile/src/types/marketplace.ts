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

export type RentalCondition = 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD';

export interface RentalListing {
  _id: string;
  ownerId: string;
  clothingItemId?: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: RentalCondition;
  dailyRentalPrice: number;
  securityDeposit: number;
  minRentalDays: number;
  maxRentalDays: number;
  locationArea: string;
  pickupAddressInstruction: string;
  images: string[];
  status: 'AVAILABLE' | 'RENTED' | 'PAUSED';
  rating: number;
  reviewsCount: number;
  rentalPolicy?: string;
  createdAt: string;
}

export interface RentalBooking {
  _id: string;
  listingId: RentalListing | string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalFee: number;
  depositFee: number;
  totalAmount: number;
  status: BookingStatus;
  deliveryMethod: 'PICKUP' | 'COURIER';
  renterNotes?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface ProductItem {
  _id: string;
  merchantName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  currency: string;
  images: string[];
  affiliateUrl: string;
  inStock: boolean;
  tags: string[];
}
