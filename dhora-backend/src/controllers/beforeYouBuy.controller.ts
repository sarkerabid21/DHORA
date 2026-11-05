import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClothingItem } from '../models/clothingItem.model';
import { Wishlist } from '../models/wishlist.model';
import { storageService } from '../services/storage.service';
import { geminiService } from '../services/gemini.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const analyzeProductBeforeBuy = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const productName = req.body.productName || req.body.title;
    const imageUrl = req.body.imageUrl || req.body.image;
    const productUrl = req.body.productUrl || '';
    const category = req.body.category;
    const primaryColor = req.body.primaryColor || req.body.color;
    const price = req.body.price;

    if (!productName || !imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Product name and image are required.',
      });
      return;
    }

    let userItems: any[] = [];
    if (isDbConnected()) {
      try {
        userItems = await ClothingItem.find({
          userId,
          status: { $ne: 'ARCHIVED' },
        });
      } catch (err) {}
    }
    if (userItems.length === 0 && userId) {
      userItems = storageService.getWardrobeItems(userId);
    }

    const targetCategory = (category || 'TOPS').toUpperCase();
    const targetColor = (primaryColor || 'Neutral').toLowerCase();

    // AI-Driven Wardrobe Evaluation & Duplicate Detection
    const aiResult = await geminiService.analyzeBeforeYouBuyWithAI(
      productName,
      targetCategory,
      primaryColor || 'Neutral',
      price ? Number(price) : undefined,
      userItems
    );

    let compatibleCounterparts: typeof userItems = [];
    if (targetCategory === 'TOPS' || targetCategory === 'TRADITIONAL') {
      compatibleCounterparts = userItems.filter((i) => i.category === 'BOTTOMS');
    } else if (targetCategory === 'BOTTOMS') {
      compatibleCounterparts = userItems.filter(
        (i) => i.category === 'TOPS' || i.category === 'TRADITIONAL'
      );
    } else {
      compatibleCounterparts = userItems.filter(
        (i) => i.category === 'TOPS' || i.category === 'BOTTOMS'
      );
    }

    res.status(200).json({
      success: true,
      data: {
        productName,
        productUrl,
        imageUrl,
        category: targetCategory,
        primaryColor: primaryColor || 'Neutral',
        estimatedPrice: price,
        compatibilityScore: aiResult.compatibilityScore,
        recommendationBadge: aiResult.recommendationBadge,
        verdict: aiResult.verdict,
        newCombinationsCount: aiResult.newCombinationsCount,
        similarItemNames: aiResult.similarItemNames,
        aiValuableComment: aiResult.aiValuableComment,
        stylingRationale: aiResult.stylingRationale,
        compatibleItemsSample: compatibleCounterparts.slice(0, 3).map((i) => ({
          id: i._id,
          name: i.name,
          category: i.category,
          imageUrl: i.imageUrl,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing prospective purchase.',
    });
  }
};

export const saveToWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      productName,
      productUrl,
      imageUrl,
      category,
      primaryColor,
      estimatedPrice,
      compatibilityScore,
      recommendationBadge,
      newCombinationsCount,
      similarItemNames,
      stylingRationale,
      notes,
    } = req.body;

    const memWishlist = (global as any)._dhora_wishlist = (global as any)._dhora_wishlist || [];

    if (isDbConnected()) {
      try {
        const saved = await Wishlist.create({
          userId,
          productName,
          productUrl,
          imageUrl,
          category: category || 'TOPS',
          primaryColor,
          estimatedPrice,
          compatibilityScore: compatibilityScore || 85,
          recommendationBadge: recommendationBadge || 'Fits Your Wardrobe',
          newCombinationsCount: newCombinationsCount || 3,
          similarItemNames: similarItemNames || [],
          stylingRationale: stylingRationale || 'Compatible staple piece.',
          notes,
        });

        res.status(201).json({
          success: true,
          message: 'Product saved to your Before-You-Buy wishlist.',
          data: saved,
        });
        return;
      } catch (err) {}
    }

    const saved = {
      _id: `wish_${Date.now()}`,
      userId,
      productName,
      productUrl,
      imageUrl,
      category: category || 'TOPS',
      primaryColor,
      estimatedPrice,
      compatibilityScore: compatibilityScore || 85,
      recommendationBadge: recommendationBadge || 'Fits Your Wardrobe',
      newCombinationsCount: newCombinationsCount || 3,
      similarItemNames: similarItemNames || [],
      stylingRationale: stylingRationale || 'Compatible staple piece.',
      notes,
      createdAt: new Date(),
    };
    memWishlist.unshift(saved);

    res.status(201).json({
      success: true,
      message: 'Product saved to your Before-You-Buy wishlist.',
      data: saved,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving to wishlist.',
    });
  }
};

export const getWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (isDbConnected()) {
      try {
        const items = await Wishlist.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
          success: true,
          data: items,
        });
        return;
      } catch (err) {}
    }

    const memWishlist = ((global as any)._dhora_wishlist || []).filter(
      (w: any) => w.userId === userId
    );

    res.status(200).json({
      success: true,
      data: memWishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching wishlist.',
    });
  }
};

export const removeFromWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        await Wishlist.findOneAndDelete({ _id: id, userId });
      } catch (err) {}
    }

    if ((global as any)._dhora_wishlist) {
      (global as any)._dhora_wishlist = (global as any)._dhora_wishlist.filter(
        (w: any) => !(w._id === id && w.userId === userId)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing from wishlist.',
    });
  }
};
