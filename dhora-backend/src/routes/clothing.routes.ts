import { Router } from 'express';
import {
  recognizeClothingImage,
  createClothingItem,
  getClothingItems,
  getClothingItemById,
  updateClothingItem,
  updateClothingStatus,
  toggleFavorite,
  deleteClothingItem,
  seedStarterWardrobe,
} from '../controllers/clothing.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// AI recognition
router.post('/recognize', recognizeClothingImage);

// Demo seed (explicit user action only)
router.post('/seed-demo', seedStarterWardrobe);

// Wardrobe CRUD
router.post('/', createClothingItem);
router.get('/', getClothingItems);
router.get('/:id', getClothingItemById);
router.patch('/:id', updateClothingItem);
router.patch('/:id/status', updateClothingStatus);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteClothingItem);

export default router;
