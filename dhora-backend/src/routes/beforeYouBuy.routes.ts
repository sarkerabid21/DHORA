import { Router } from 'express';
import {
  analyzeProductBeforeBuy,
  saveToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/beforeYouBuy.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', analyzeProductBeforeBuy);
router.post('/wishlist', saveToWishlist);
router.get('/wishlist', getWishlist);
router.delete('/wishlist/:id', removeFromWishlist);

export default router;
