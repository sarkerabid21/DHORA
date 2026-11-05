import { Router } from 'express';
import {
  generateTripStylistPlan,
  getTripPlans,
} from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/plan', generateTripStylistPlan);
router.get('/', getTripPlans);

export default router;
