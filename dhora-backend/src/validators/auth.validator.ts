import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().optional(),
  consentAgreed: z.boolean().optional(),
});

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'OTP must be at least 4 digits'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']).optional(),
  preferredLanguage: z.enum(['bn', 'en']).optional(),
  locationArea: z.string().max(100).optional(),
  bio: z.string().max(300).optional(),
  pushToken: z.string().optional(),
});

export const updateStylePreferencesSchema = z.object({
  preferredCategories: z.array(z.string()).min(1, 'Select at least one category'),
  preferredColors: z.array(z.string()).min(1, 'Select at least one color'),
  avoidedColors: z.array(z.string()).optional(),
  styleAesthetic: z.array(z.string()).min(1, 'Select at least one style aesthetic'),
  occasions: z.array(z.string()).min(1, 'Select at least one occasion'),
  fitPreference: z.enum(['SLIM', 'REGULAR', 'OVERSIZED', 'COMFORT']).default('REGULAR'),
});
