import { create } from 'zustand';
import { api } from '../services/api';
import { RentalListing, RentalBooking, BookingStatus } from '../types/marketplace';

interface RentalState {
  listings: RentalListing[];
  myListings: RentalListing[];
  bookings: RentalBooking[];
  isLoading: boolean;

  fetchListings: () => Promise<void>;
  createListing: (data: Omit<RentalListing, '_id' | 'ownerId' | 'rating' | 'reviewsCount' | 'createdAt'>) => Promise<RentalListing>;
  createBooking: (data: {
    listingId: string;
    startDate: string;
    endDate: string;
    deliveryMethod?: 'PICKUP' | 'COURIER';
    renterNotes?: string;
  }) => Promise<RentalBooking | null>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  submitConditionReport: (data: {
    bookingId: string;
    stage: 'PRE_RENTAL_DISPATCH' | 'POST_RENTAL_RETURN';
    photos: string[];
    notes: string;
  }) => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  reset: () => void;
}

export const DEFAULT_RENTAL_LISTINGS: RentalListing[] = [
  {
    _id: 'listing_rent_1',
    title: 'Heritage Silk Jamdani Panjabi with Antique Embroidery',
    description: 'Worn once for brother wedding. Genuine Dhakai Jamdani handloom silk with gold zari needlework. Hand-dry cleaned and in impeccable condition.',
    category: 'TRADITIONAL',
    size: '40 (M)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 650,
    securityDeposit: 1500,
    minRentalDays: 2,
    maxRentalDays: 7,
    locationArea: 'Dhaka (Dhanmondi)',
    pickupAddressInstruction: 'Meet at Dhanmondi 27 Star Kabab or Courier available via Pathao Parcel.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 6,
    ownerId: 'owner_sultana',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_2',
    title: 'Bespoke Charcoal Double-Breasted Wool Tuxedo',
    description: 'Custom tailored Italian wool blend tuxedo with silk satin peak lapels. Ideal for corporate galas and wedding receptions.',
    category: 'OUTERWEAR',
    size: '38R (M)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 1200,
    securityDeposit: 3000,
    minRentalDays: 2,
    maxRentalDays: 5,
    locationArea: 'Dhaka (Gulshan)',
    pickupAddressInstruction: 'Gulshan 2 Pink City shopping arcade pickup point.',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'],
    status: 'AVAILABLE',
    rating: 5.0,
    reviewsCount: 4,
    ownerId: 'owner_fahim',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_3',
    title: 'Handcrafted Crimson Benarasi Katan Bridal Saree',
    description: 'Authentic Mirpur Benarasi Katan saree with heavy floral jaal border. Perfect for festive weddings.',
    category: 'TRADITIONAL',
    size: 'Free Size',
    condition: 'BRAND_NEW',
    dailyRentalPrice: 1800,
    securityDeposit: 4000,
    minRentalDays: 3,
    maxRentalDays: 7,
    locationArea: 'Dhaka (Mirpur)',
    pickupAddressInstruction: 'Mirpur 10 Benarasi Polli verified pickup point.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 3,
    ownerId: 'owner_afia',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_4',
    title: 'Royal Maroon Velvet Embroidered Sherwani',
    description: 'Luxury zardozi work handcrafted velvet groom / groomsman sherwani with brooch and churidar.',
    category: 'TRADITIONAL',
    size: '42 (L)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 1500,
    securityDeposit: 3500,
    minRentalDays: 2,
    maxRentalDays: 5,
    locationArea: 'Dhaka (Banani)',
    pickupAddressInstruction: 'Banani 11 verified handover point or courier delivery.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    status: 'AVAILABLE',
    rating: 5.0,
    reviewsCount: 5,
    ownerId: 'owner_tanvir',
    createdAt: new Date().toISOString(),
  },
];

export const useRentalStore = create<RentalState>((set, get) => ({
  listings: DEFAULT_RENTAL_LISTINGS,
  myListings: [],
  bookings: [],
  isLoading: false,

  fetchListings: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/rentals');
      if (res.data?.data && res.data.data.length > 0) {
        set({ listings: res.data.data, isLoading: false });
        return;
      }
    } catch (e) {}
    set({ listings: DEFAULT_RENTAL_LISTINGS, isLoading: false });
  },

  createListing: async (data) => {
    try {
      const res = await api.post('/rentals', data);
      if (res.data?.data) {
        const item = res.data.data;
        set((state) => ({
          listings: [item, ...state.listings],
          myListings: [item, ...state.myListings],
        }));
        return item;
      }
    } catch (e) {}

    const newListing: RentalListing = {
      ...data,
      _id: 'rent_' + Date.now().toString(),
      ownerId: 'current_user',
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      listings: [newListing, ...state.listings],
      myListings: [newListing, ...state.myListings],
    }));

    return newListing;
  },

  createBooking: async ({ listingId, startDate, endDate, deliveryMethod, renterNotes }) => {
    const listing = get().listings.find((l) => l._id === listingId);
    if (!listing) return null;

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const totalDays = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);

    const rentalFee = totalDays * listing.dailyRentalPrice;
    const depositFee = listing.securityDeposit;
    const totalAmount = rentalFee + depositFee;

    try {
      const res = await api.post('/rentals/bookings', {
        listingId,
        startDate,
        endDate,
        deliveryMethod,
        renterNotes,
      });

      if (res.data?.data) {
        const booking = res.data.data;
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      }
    } catch (e) {}

    const newBooking: RentalBooking = {
      _id: 'booking_' + Date.now().toString(),
      listingId: listing,
      renterId: 'current_user',
      ownerId: listing.ownerId,
      startDate,
      endDate,
      totalDays,
      rentalFee,
      depositFee,
      totalAmount,
      status: 'PENDING',
      deliveryMethod: deliveryMethod || 'PICKUP',
      renterNotes,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ bookings: [newBooking, ...state.bookings] }));
    return newBooking;
  },

  updateBookingStatus: async (id: string, status: BookingStatus) => {
    set((state) => ({
      bookings: state.bookings.map((b) => (b._id === id ? { ...b, status } : b)),
    }));

    try {
      await api.patch(`/rentals/bookings/${id}/status`, { status });
    } catch (e) {}
  },

  submitConditionReport: async ({ bookingId, stage, photos, notes }) => {
    try {
      await api.post(`/rentals/bookings/${bookingId}/condition-report`, {
        stage,
        photos,
        notes,
      });
    } catch (e) {}
  },

  fetchMyBookings: async () => {
    try {
      const res = await api.get('/rentals/my-bookings');
      if (res.data?.data) {
        set({ bookings: res.data.data });
      }
    } catch (e) {}
  },

  reset: () => {
    set({
      listings: [],
      myListings: [],
      bookings: [],
      isLoading: false,
    });
  },
}));
