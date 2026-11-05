import { Router } from 'express';
import {
  getMe,
  updateProfile,
  getStylePreferences,
  updateStylePreferences,
  changePassword,
  deleteAccount,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  updateProfileSchema,
  updateStylePreferencesSchema,
} from '../validators/auth.validator';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/profile', validateRequest(updateProfileSchema), updateProfile);
router.get('/style-preferences', getStylePreferences);
router.put(
  '/style-preferences',
  validateRequest(updateStylePreferencesSchema),
  updateStylePreferences
);
router.put('/change-password', changePassword);
router.delete('/me', deleteAccount);
router.delete('/account', deleteAccount);

export default router;
