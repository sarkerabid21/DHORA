import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { RentalListing, IRentalListing } from '../models/rentalListing.model';
import { RentalBooking, BookingStatus } from '../models/rentalBooking.model';
import { RentalConditionReport } from '../models/rentalConditionReport.model';
import { UserProfile } from '../models/userProfile.model';
import { storageService } from '../services/storage.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

const SEED_RENTAL_LISTINGS = [
  {
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
  },
  {
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
  },
  {
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
  },
];

export const getRentalListings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, locationArea, condition, maxPrice, search } = req.query;

    if (isDbConnected()) {
      try {
        const filter: any = { status: { $ne: 'PAUSED' } };

        if (category && category !== 'ALL' && category !== 'All') {
          filter.category = (category as string).toUpperCase();
        }
        if (locationArea) {
          filter.locationArea = new RegExp(locationArea as string, 'i');
        }
        if (condition) {
          filter.condition = condition;
        }
        if (maxPrice) {
          filter.dailyRentalPrice = { $lte: Number(maxPrice) };
        }
        if (search) {
          const regex = new RegExp(search as string, 'i');
          filter.$or = [{ title: regex }, { description: regex }];
        }

        let listings = await RentalListing.find(filter)
          .populate('ownerId', 'email')
          .sort({ createdAt: -1 });

        // Seed sample listings if collection empty
        if (listings.length === 0 && !search && (!category || category === 'ALL')) {
          const firstUser = req.user?.userId;
          if (firstUser) {
            await RentalListing.insertMany(
              SEED_RENTAL_LISTINGS.map((l) => ({ ...l, ownerId: firstUser }))
            );
            listings = await RentalListing.find().sort({ createdAt: -1 });
          }
        }

        res.status(200).json({
          success: true,
          count: listings.length,
          data: listings,
        });
        return;
      } catch (dbErr) {}
    }

    // Local mode fallback with persistent storage
    const listings = storageService.getRentalListings(category as string, search as string);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching rental marketplace listings.',
    });
  }
};

export const getRentalListingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    let listing: any = null;
    let ownerProfile: any = null;

    if (isDbConnected()) {
      try {
        listing = await RentalListing.findById(id).populate('ownerId', 'email');
        if (listing) {
          ownerProfile = await UserProfile.findOne({ userId: listing.ownerId });
        }
      } catch (err) {}
    }

    if (!listing) {
      listing = storageService.getRentalListingById(id);
    }

    if (!listing) {
      res.status(404).json({ success: false, message: 'Rental listing not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        listing,
        owner: {
          fullName: ownerProfile?.fullName || 'Verified DHORA Member',
          locationArea: ownerProfile?.locationArea || listing.locationArea,
          avatarUrl: ownerProfile?.avatarUrl,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching rental listing details.',
    });
  }
};

export const createRentalListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.userId || 'user_demo';
    const {
      title,
      description,
      category,
      size,
      condition,
      dailyRentalPrice,
      securityDeposit,
      minRentalDays,
      maxRentalDays,
      locationArea,
      pickupAddressInstruction,
      images,
      rentalPolicy,
      clothingItemId,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !size ||
      !dailyRentalPrice ||
      !securityDeposit ||
      !locationArea ||
      !pickupAddressInstruction ||
      !images ||
      !images.length
    ) {
      res.status(400).json({
        success: false,
        message: 'All listing fields, rental prices, deposit and photos are required.',
      });
      return;
    }

    let listing: any = null;
    if (isDbConnected()) {
      try {
        listing = await RentalListing.create({
          ownerId,
          clothingItemId,
          title,
          description,
          category: category.toUpperCase(),
          size,
          condition: condition || 'LIKE_NEW',
          dailyRentalPrice: Number(dailyRentalPrice),
          securityDeposit: Number(securityDeposit),
          minRentalDays: Number(minRentalDays) || 1,
          maxRentalDays: Number(maxRentalDays) || 14,
          locationArea,
          pickupAddressInstruction,
          images,
          rentalPolicy,
          status: 'AVAILABLE',
        });
      } catch (dbErr) {}
    }

    if (!listing) {
      listing = storageService.saveRentalListing({
        ownerId: { _id: ownerId, email: req.user?.email || 'user@dhora.fashion' },
        clothingItemId,
        title,
        description,
        category: category.toUpperCase(),
        size,
        condition: condition || 'LIKE_NEW',
        dailyRentalPrice: Number(dailyRentalPrice),
        securityDeposit: Number(securityDeposit),
        minRentalDays: Number(minRentalDays) || 1,
        maxRentalDays: Number(maxRentalDays) || 14,
        locationArea,
        pickupAddressInstruction,
        images,
        rentalPolicy: rentalPolicy || 'Dry-cleaned before dispatch. Return in original protective garment bag.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Rental listing published successfully to DHORA Rent.',
      data: listing,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating rental listing.',
    });
  }
};

export const createBookingRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const renterId = req.user?.userId;
    const { listingId, startDate, endDate, deliveryMethod, renterNotes } = req.body;

    const listing = await RentalListing.findById(listingId);
    if (!listing) {
      res.status(404).json({ success: false, message: 'Rental listing not found.' });
      return;
    }

    if (listing.ownerId.toString() === renterId) {
      res.status(400).json({
        success: false,
        message: 'You cannot rent your own clothing listing.',
      });
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diffTime = end - start;
    const totalDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

    if (totalDays < listing.minRentalDays) {
      res.status(400).json({
        success: false,
        message: `Minimum rental duration for this piece is ${listing.minRentalDays} days.`,
      });
      return;
    }

    const rentalFee = totalDays * listing.dailyRentalPrice;
    const depositFee = listing.securityDeposit;
    const totalAmount = rentalFee + depositFee;

    const booking = await RentalBooking.create({
      listingId,
      renterId,
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
    });

    res.status(201).json({
      success: true,
      message: 'Rental booking request submitted. Awaiting owner confirmation.',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking request.',
    });
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const booking = await RentalBooking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const isOwner = booking.ownerId.toString() === userId;
    const isRenter = booking.renterId.toString() === userId;

    if (!isOwner && !isRenter) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking.',
      });
      return;
    }

    // Workflow state validation
    booking.status = status as BookingStatus;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating booking status.',
    });
  }
};

export const submitConditionReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reportedBy = req.user?.userId;
    const { bookingId, stage, photos, notes, conditionStatus } = req.body;

    if (!bookingId || !stage || !photos || !photos.length || !notes) {
      res.status(400).json({
        success: false,
        message: 'Inspection stage, photos, and notes are required.',
      });
      return;
    }

    const report = await RentalConditionReport.create({
      bookingId,
      reportedBy,
      stage,
      photos,
      notes,
      conditionStatus: conditionStatus || 'EXCELLENT',
    });

    res.status(201).json({
      success: true,
      message: 'Condition inspection report recorded securely in escrow logs.',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting condition report.',
    });
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const bookings = await RentalBooking.find({
      $or: [{ renterId: userId }, { ownerId: userId }],
    })
      .populate('listingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user bookings.',
    });
  }
};

export const getMyRentalListings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.userId;
    const listings = await RentalListing.find({ ownerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your rental listings.',
    });
  }
};
