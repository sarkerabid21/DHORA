import { Router } from 'express';
import {
  getRentalListings,
  getRentalListingById,
  createRentalListing,
  createBookingRequest,
  updateBookingStatus,
  submitConditionReport,
  getMyBookings,
  getMyRentalListings,
} from '../controllers/rental.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Explore & Create Listings
router.get('/', getRentalListings);
router.post('/', createRentalListing);
router.get('/my-listings', getMyRentalListings);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getRentalListingById);

// Bookings & Condition Verification
router.post('/bookings', createBookingRequest);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/bookings/condition-report', submitConditionReport);

export default router;
