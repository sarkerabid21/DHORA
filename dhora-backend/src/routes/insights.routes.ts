import { Router } from 'express';
import { getWardrobeInsights } from '../controllers/insights.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/wardrobe', getWardrobeInsights);

export default router;
