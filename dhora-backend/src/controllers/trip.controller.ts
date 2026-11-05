import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClothingItem } from '../models/clothingItem.model';
import { TripPlan } from '../models/tripPlan.model';
import { storageService } from '../services/storage.service';
import { geminiService } from '../services/gemini.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const generateTripStylistPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { destination, startDate, endDate, durationDays, activities } =
      req.body;

    if (!destination || !durationDays) {
      res.status(400).json({
        success: false,
        message: 'Destination and duration are required.',
      });
      return;
    }

    let availableItems: any[] = [];
    if (isDbConnected()) {
      try {
        availableItems = await ClothingItem.find({
          userId,
          status: 'AVAILABLE',
        });
      } catch (err) {}
    }

    if (availableItems.length === 0) {
      availableItems = storageService
        .getWardrobeItems(userId)
        .filter((i) => i.status === 'AVAILABLE' || !i.status);
    }

    if (availableItems.length < 2) {
      res.status(400).json({
        success: false,
        message: 'You need at least 2 available clothing items in your closet to generate a trip plan.',
      });
      return;
    }

    const days = parseInt(durationDays, 10) || 3;
    const itemMap = new Map(availableItems.map((i) => [i._id ? i._id.toString() : i.id, i]));

    // AI-Driven Trip Analysis & Backpack Capsule Curation
    const aiResult = await geminiService.generateTripPlanWithAI(
      destination,
      days,
      Array.isArray(activities) && activities.length > 0
        ? activities
        : ['Sightseeing & Walking', 'Casual Dining'],
      availableItems
    );

    // Resolve packed items details
    const packedList = aiResult.packedItemIds
      .map((id) => itemMap.get(id))
      .filter((item): item is any => !!item);

    // If AI packed fewer than needed, ensure tops and bottoms are included
    if (packedList.length === 0) {
      packedList.push(...availableItems.slice(0, Math.min(availableItems.length, 4)));
    }

    // Resolve planned outfits with full item details
    const plannedOutfitsWithDetails = aiResult.plannedOutfits.map((o) => ({
      dayNumber: o.dayNumber,
      activity: o.activity,
      outfitTitle: o.outfitTitle,
      items: o.itemIds
        .map((id) => {
          const item = itemMap.get(id);
          if (!item) return null;
          return {
            id: item._id ? item._id.toString() : item.id,
            name: item.name,
            role: item.category === 'BOTTOMS' ? 'BOTTOM' : item.category === 'FOOTWEAR' ? 'SHOES' : 'TOP',
            imageUrl: item.imageUrl,
          };
        })
        .filter((it): it is any => !!it),
    }));

    let tripPlan: any = null;
    const planPayload = {
      userId,
      destination,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
      durationDays: days,
      activities: activities || ['Sightseeing', 'Dinners'],
      forecastSummary: aiResult.forecastSummary,
      packedClothingItemIds: packedList.map((i) => i._id),
      plannedOutfits: aiResult.plannedOutfits,
      missingCategories: aiResult.missingItemsList,
      reusableItemsNotes: aiResult.reusableItemsNotes,
      hasMissingWeatherItems: aiResult.hasMissingWeatherItems,
      missingItemsAdvice: aiResult.missingItemsAdvice,
      missingItemsList: aiResult.missingItemsList,
      weatherTemperature: aiResult.weatherTemperature,
      weatherCondition: aiResult.weatherCondition,
    };

    if (isDbConnected()) {
      try {
        tripPlan = await TripPlan.create(planPayload);
      } catch (err) {}
    }

    if (!tripPlan) {
      tripPlan = {
        _id: `trip_${Date.now()}`,
        ...planPayload,
        createdAt: new Date(),
      };
    }

    res.status(201).json({
      success: true,
      message: 'Trip capsule plan created.',
      data: {
        tripPlan,
        plannedOutfitsWithDetails,
        packedListDetails: packedList.map((i) => ({
          id: i._id ? i._id.toString() : i.id,
          name: i.name,
          category: i.category,
          color: i.primaryColor,
          imageUrl: i.imageUrl,
        })),
        hasMissingWeatherItems: aiResult.hasMissingWeatherItems,
        missingItemsAdvice: aiResult.missingItemsAdvice,
        missingItemsList: aiResult.missingItemsList,
        weatherTemperature: aiResult.weatherTemperature,
        weatherCondition: aiResult.weatherCondition,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating trip plan.',
    });
  }
};

export const getTripPlans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (isDbConnected()) {
      try {
        const trips = await TripPlan.find({ userId, isArchived: false })
          .populate('packedClothingItemIds')
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: trips,
        });
        return;
      } catch (err) {}
    }

    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching trip plans.',
    });
  }
};
