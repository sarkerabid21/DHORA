import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClothingItem } from '../models/clothingItem.model';
import { Outfit } from '../models/outfit.model';
import { WardrobeUsage } from '../models/wardrobeUsage.model';
import { OutfitCalendar } from '../models/outfitCalendar.model';
import { storageService } from '../services/storage.service';

export const getWardrobeInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';

    let [items, outfits, usages] = await Promise.all([
      ClothingItem.find({ userId, status: { $ne: 'ARCHIVED' } }).catch(() => []),
      Outfit.find({ userId }).catch(() => []),
      WardrobeUsage.find({ userId }).sort({ dateWorn: -1 }).catch(() => []),
    ]);

    if ((!items || items.length === 0) && userId) {
      items = storageService.getWardrobeItems(userId);
    }

    if (!items || items.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalOutfits: 0,
          totalClosetValue: 0,
          totalWornCount: 0,
          avgCostPerWear: 0,
          hasEnoughData: false,
          categoryCounts: {},
          colorCounts: {},
          mostWorn: [],
          underused: [],
          recentlyWorn: [],
          gapRecommendations: [
            {
              category: 'Digitize First Staple',
              reason: 'Your closet is currently empty. Add at least 2 clothing items to unlock real cost-per-wear stats and gap analysis.',
            },
          ],
          repetitionAlert: null,
        },
      });
      return;
    }

    const totalItems = items.length;
    const totalOutfits = outfits.length;

    // Total valuation
    const totalClosetValue = items.reduce(
      (sum, item) => sum + (item.purchasePrice || 0),
      0
    );

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    let totalWornCount = 0;

    for (const item of items) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      colorCounts[item.primaryColor] =
        (colorCounts[item.primaryColor] || 0) + 1;
      totalWornCount += item.timesWorn || 0;
    }

    // Average Cost Per Wear across all clothes with price
    const itemsWithPrice = items.filter((i) => i.purchasePrice && i.purchasePrice > 0);
    const avgCostPerWear =
      itemsWithPrice.length > 0
        ? Math.round(
            itemsWithPrice.reduce(
              (sum, i) => sum + i.purchasePrice! / Math.max(i.timesWorn, 1),
              0
            ) / itemsWithPrice.length
          )
        : 0;

    // Frequently Worn Items (Top 4)
    const mostWorn = [...items]
      .sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0))
      .slice(0, 4);

    // Underused Items (Times worn <= 1)
    const underused = [...items]
      .sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0))
      .slice(0, 4);

    // Recently Worn Items
    const recentlyWorn = [...items]
      .filter((i) => i.lastWornDate)
      .sort(
        (a, b) =>
          new Date(b.lastWornDate!).getTime() -
          new Date(a.lastWornDate!).getTime()
      )
      .slice(0, 4);

    // Gap Analysis: calculate ratios & recommendations
    const topsCount = categoryCounts['TOPS'] || 0;
    const bottomsCount = categoryCounts['BOTTOMS'] || 0;
    const footwearCount = categoryCounts['FOOTWEAR'] || 0;
    const tradCount = categoryCounts['TRADITIONAL'] || 0;
    const outerwearCount = categoryCounts['OUTERWEAR'] || 0;

    const gapRecommendations: { category: string; reason: string }[] = [];

    if (bottomsCount < 3) {
      gapRecommendations.push({
        category: 'Versatile Bottoms',
        reason:
          'Having only ' +
          bottomsCount +
          ' bottom(s) limits variety. Adding neutral chinos or tailored trousers will multiply your outfit combinations.',
      });
    }

    if (footwearCount < 2) {
      gapRecommendations.push({
        category: 'Footwear Contrast',
        reason:
          'A wardrobe needs at least one pair of versatile loafers/formals and one pair of clean sneakers to adapt to different occasions.',
      });
    }

    if (outerwearCount === 0) {
      gapRecommendations.push({
        category: 'Layering Piece',
        reason:
          'No lightweight jackets or overshirts detected. An overshirt or blazer adds depth to simple t-shirts and shirts.',
      });
    }

    if (tradCount === 0) {
      gapRecommendations.push({
        category: 'Traditional Attire',
        reason:
          'No Panjabi or traditional set registered. A classic white or pastel cotton Panjabi is essential for festive and cultural events.',
      });
    }

    // Outfit Repetition Alert: Check recent logs in past 14 days
    const recentUsages = usages.slice(0, 10);
    const outfitFrequency: Record<string, number> = {};
    let repetitionAlert: string | null = null;

    for (const u of recentUsages) {
      if (u.outfitId) {
        const id = u.outfitId.toString();
        outfitFrequency[id] = (outfitFrequency[id] || 0) + 1;
        if (outfitFrequency[id] >= 2) {
          repetitionAlert =
            'You have worn an outfit 2 or more times recently. Consider switching up accessories or layering to refresh your look.';
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalOutfits,
        totalClosetValue,
        totalWornCount,
        avgCostPerWear,
        categoryCounts,
        colorCounts,
        mostWorn,
        underused,
        recentlyWorn,
        gapRecommendations,
        repetitionAlert,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating wardrobe intelligence.',
    });
  }
};
