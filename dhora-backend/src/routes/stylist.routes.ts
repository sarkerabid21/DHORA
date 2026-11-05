import { Router } from 'express';
import {
  generateOutfits,
  chatWithStylist,
  saveOutfit,
  getSavedOutfits,
  deleteSavedOutfit,
  submitOutfitFeedback,
  getTodayWeatherOutfit,
} from '../controllers/stylist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Grounded Outfit Generation
router.post('/generate', generateOutfits);

// Interactive AI Stylist Chat
router.post('/chat', chatWithStylist);

// Saved Looks CRUD
router.get('/saved', getSavedOutfits);
router.post('/save', saveOutfit);
router.delete('/saved/:id', deleteSavedOutfit);

// Feedback & Learning
router.post('/feedback', submitOutfitFeedback);

// Weather-based styling
router.get('/weather-outfit', getTodayWeatherOutfit);

export default router;
