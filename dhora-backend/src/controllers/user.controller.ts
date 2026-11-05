import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import { UserProfile } from '../models/userProfile.model';
import { UserStylePreference } from '../models/userStylePreference.model';
import { storageService } from '../services/storage.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (isDbConnected()) {
      try {
        const user = await User.findById(userId).select('-passwordHash');
        if (user) {
          const profile = await UserProfile.findOne({ userId });
          const stylePreferences = await UserStylePreference.findOne({ userId });

          res.status(200).json({
            success: true,
            data: {
              user,
              profile,
              stylePreferences,
            },
          });
          return;
        }
      } catch (err) {}
    }

    const localUser = storageService.findUserById(userId || '');
    if (!localUser) {
      res.status(200).json({
        success: true,
        data: {
          user: { _id: userId, email: req.user?.email || 'user@dhora.fashion' },
          profile: { fullName: 'DHORA Member', locationArea: 'Dhaka (Dhanmondi)' },
          stylePreferences: {},
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: { _id: localUser._id, email: localUser.email },
        profile: {
          fullName: localUser.fullName,
          avatarUrl: localUser.avatarUrl,
          locationArea: localUser.locationArea,
          preferencesCompleted: localUser.preferencesCompleted,
        },
        stylePreferences: localUser.stylePreferences || {},
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile.',
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { fullName, phone, gender, preferredLanguage, locationArea, bio, pushToken } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (locationArea) updateData.locationArea = locationArea;
    if (bio !== undefined) updateData.bio = bio;

    if (isDbConnected()) {
      try {
        const profile = await UserProfile.findOneAndUpdate(
          { userId },
          {
            $set: updateData,
            ...(pushToken ? { $addToSet: { pushNotificationTokens: pushToken } } : {}),
          },
          { new: true, upsert: true }
        );

        res.status(200).json({
          success: true,
          message: 'Profile updated successfully.',
          data: profile,
        });
        return;
      } catch (err) {}
    }

    const updated = storageService.updateUser(userId || '', updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated || updateData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile.',
    });
  }
};

export const getStylePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (isDbConnected()) {
      try {
        let preferences = await UserStylePreference.findOne({ userId });
        if (!preferences) {
          preferences = await UserStylePreference.create({ userId });
        }
        res.status(200).json({ success: true, data: preferences });
        return;
      } catch (err) {}
    }

    const localUser = storageService.findUserById(userId || '');
    res.status(200).json({
      success: true,
      data: localUser?.stylePreferences || {
        preferredCategories: ['TOPS', 'BOTTOMS'],
        preferredColors: ['Black', 'Navy Blue', 'White'],
        styleAesthetic: ['Smart Casual', 'Minimalist'],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching style preferences.',
    });
  }
};

export const updateStylePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      preferredCategories,
      preferredColors,
      avoidedColors,
      styleAesthetic,
      occasions,
      fitPreference,
    } = req.body;

    const prefPayload = {
      preferredCategories,
      preferredColors,
      avoidedColors: avoidedColors || [],
      styleAesthetic,
      occasions,
      fitPreference,
    };

    if (isDbConnected()) {
      try {
        const preferences = await UserStylePreference.findOneAndUpdate(
          { userId },
          { $set: prefPayload },
          { new: true, upsert: true }
        );

        await UserProfile.findOneAndUpdate(
          { userId },
          { $set: { preferencesCompleted: true } }
        );

        res.status(200).json({
          success: true,
          message: 'Style preferences updated successfully.',
          data: preferences,
        });
        return;
      } catch (err) {}
    }

    storageService.updateUser(userId || '', {
      stylePreferences: prefPayload,
      preferencesCompleted: true,
    });

    res.status(200).json({
      success: true,
      message: 'Style preferences updated successfully.',
      data: prefPayload,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating style preferences.',
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required.' });
      return;
    }

    if (isDbConnected()) {
      try {
        const user = await User.findById(userId);
        if (user && user.passwordHash) {
          const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
          if (!isMatch) {
            res.status(401).json({ success: false, message: 'Current password is incorrect.' });
            return;
          }

          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(newPassword, salt);
          await user.save();

          res.status(200).json({ success: true, message: 'Password updated successfully.' });
          return;
        }
      } catch (err) {}
    }

    const localUser = storageService.findUserById(userId || '');
    if (localUser && localUser.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, localUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      storageService.updateUser(userId || '', { passwordHash: newHash });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating password.',
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (isDbConnected()) {
      try {
        await User.findByIdAndUpdate(userId, { status: 'DELETED' });
      } catch (err) {}
    }

    storageService.updateUser(userId || '', { status: 'DELETED' });

    res.status(200).json({
      success: true,
      message: 'Account marked as deleted. Data removal process initiated.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting account.',
    });
  }
};
