import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { OutfitCalendar } from '../models/outfitCalendar.model';
import { Outfit } from '../models/outfit.model';
import { ClothingItem } from '../models/clothingItem.model';
import { WardrobeUsage } from '../models/wardrobeUsage.model';
import { storageService } from '../services/storage.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

// In-Memory store fallback
const memPlanner = new Map<string, any[]>();

export const getCalendarEvents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { startDate, endDate } = req.query;

    if (isDbConnected()) {
      try {
        const filter: any = { userId };
        if (startDate && endDate) {
          filter.date = { $gte: startDate, $lte: endDate };
        }

        const events = await OutfitCalendar.find(filter)
          .populate({
            path: 'outfitId',
            populate: { path: 'items.clothingItemId' },
          })
          .sort({ date: 1 });

        const eventsWithAudit = events.map((event: any) => {
          const outfit = event.outfitId;
          let hasLaundryConflict = false;
          const conflictingItems: string[] = [];

          if (outfit && Array.isArray(outfit.items)) {
            for (const it of outfit.items) {
              const itemDoc = it.clothingItemId;
              if (itemDoc && itemDoc.status === 'IN_LAUNDRY') {
                hasLaundryConflict = true;
                conflictingItems.push(itemDoc.name);
              }
            }
          }

          return {
            ...event.toObject(),
            hasLaundryConflict,
            conflictingItems,
          };
        });

        res.status(200).json({
          success: true,
          data: eventsWithAudit,
        });
        return;
      } catch (err) {}
    }

    const events = storageService.getPlannerEvents(userId);
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching calendar events.',
    });
  }
};

export const createCalendarEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { date, outfitId, occasion, notes } = req.body;

    if (!date || !outfitId) {
      res.status(400).json({
        success: false,
        message: 'Date and outfitId are required.',
      });
      return;
    }

    if (isDbConnected()) {
      try {
        const event = await OutfitCalendar.create({
          userId,
          date,
          outfitId,
          occasion: occasion || 'Daily Wear',
          notes,
          isWornConfirmed: false,
        });

        res.status(201).json({
          success: true,
          message: 'Outfit planned on calendar.',
          data: event,
        });
        return;
      } catch (err) {}
    }

    const newEvent = storageService.addPlannerEvent({
      userId,
      date,
      outfitId,
      occasion: occasion || 'Daily Wear',
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Outfit planned on calendar.',
      data: newEvent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error scheduling outfit.',
    });
  }
};

export const confirmWornOutfit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        const event = await OutfitCalendar.findOne({ _id: id, userId }).populate(
          'outfitId'
        );

        if (event) {
          event.isWornConfirmed = true;
          await event.save();
          res.status(200).json({
            success: true,
            message: 'Wear logged! Cost-Per-Wear updated across your wardrobe.',
            data: event,
          });
          return;
        }
      } catch (err) {}
    }

    const ev = storageService.confirmPlannerEvent(id, userId);

    res.status(200).json({
      success: true,
      message: 'Wear logged! Cost-Per-Wear updated across your wardrobe.',
      data: ev,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging outfit wear.',
    });
  }
};

export const deleteCalendarEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        await OutfitCalendar.findOneAndDelete({ _id: id, userId });
      } catch (err) {}
    }

    storageService.deletePlannerEvent(id, userId);

    res.status(200).json({
      success: true,
      message: 'Calendar event removed.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting event.',
    });
  }
};
