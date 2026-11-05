import { Router } from 'express';
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  confirmWornOutfit,
} from '../controllers/planner.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCalendarEvents);
router.post('/', createCalendarEvent);
router.delete('/:id', deleteCalendarEvent);
router.patch('/:id/confirm-worn', confirmWornOutfit);

export default router;
