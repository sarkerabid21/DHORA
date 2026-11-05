import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  guestLogin,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleAuth);
router.post('/guest', guestLogin);
router.post('/send-otp', validateRequest(sendOtpSchema), sendOtp);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
