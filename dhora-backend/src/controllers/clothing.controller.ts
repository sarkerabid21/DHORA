import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClothingItem, IClothingItem } from '../models/clothingItem.model';
import { geminiService } from '../services/gemini.service';
import { imageProcessingService } from '../services/imageProcessing.service';
import { storageService } from '../services/storage.service';
import { cloudinaryService } from '../services/cloudinary.service';

export const REALISTIC_STARTER_ITEMS: any[] = [];

// In-Memory store for offline/local development mode
export const inMemoryWardrobe = new Map<string, any[]>();

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const recognizeClothingImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { imageBase64, imageUrl } = req.body;
    const target = imageBase64 || imageUrl;

    if (!target) {
      res.status(400).json({
        success: false,
        message: 'Please provide either imageBase64 or imageUrl.',
      });
      return;
    }

    const recognized = await geminiService.recognizeClothing(target);
    const cleaned = await imageProcessingService.removeBackgroundAndClean(target);

    // Upload to Cloudinary CDN for instant high-speed delivery
    let cloudRawUrl: string | null = null;
    let cloudCutoutUrl: string | null = null;

    if (cloudinaryService.isConfigured()) {
      try {
        const rawUpload = await cloudinaryService.uploadImage(target, 'dhora/wardrobe_raw');
        if (rawUpload?.secureUrl) cloudRawUrl = rawUpload.secureUrl;

        if (cleaned?.cleanedBase64) {
          const cutoutUpload = await cloudinaryService.uploadImage(cleaned.cleanedBase64, 'dhora/wardrobe_cutouts');
          if (cutoutUpload?.secureUrl) cloudCutoutUrl = cutoutUpload.secureUrl;
        }
      } catch (uploadErr) {
        console.warn('[Cloudinary Async Upload Notice]:', uploadErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'AI clothing recognition and background cleaning completed.',
      data: {
        ...recognized,
        imageUrl: cloudRawUrl || target,
        cleanedImageUrl: cloudCutoutUrl || cleaned.cleanedBase64,
        dominantColor: cleaned.dominantColor,
        dimensions: { width: cleaned.width, height: cleaned.height },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error running AI recognition.',
    });
  }
};

export const createClothingItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const name = req.body.name || req.body.title || 'Curated Garment';
    const category = (req.body.category || 'TOPS').toUpperCase();
    const subcategory = req.body.subcategory || req.body.category || 'General';
    const primaryColor = req.body.primaryColor || req.body.color || 'Neutral';
    const imageUrl = req.body.imageUrl || req.body.image || req.body.cleanedImageUrl;
    const cleanedImageUrl = req.body.cleanedImageUrl || imageUrl;
    const {
      secondaryColors,
      pattern,
      fabric,
      seasonality,
      brand,
      size,
      purchasePrice,
      purchaseDate,
      notes,
      aiAttributes,
    } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Image URL or photo data is required.',
      });
      return;
    }

    let finalImageUrl = imageUrl;
    let finalCleanedUrl = cleanedImageUrl || imageUrl;

    // Upload to Cloudinary CDN if base64 data was supplied
    if (cloudinaryService.isConfigured()) {
      if (imageUrl && (imageUrl.startsWith('data:image') || imageUrl.length > 500)) {
        try {
          const up = await cloudinaryService.uploadImage(imageUrl, 'dhora/wardrobe');
          if (up?.secureUrl) finalImageUrl = up.secureUrl;
        } catch (e) {}
      }
      if (cleanedImageUrl && (cleanedImageUrl.startsWith('data:image') || cleanedImageUrl.length > 500)) {
        try {
          const up = await cloudinaryService.uploadImage(cleanedImageUrl, 'dhora/wardrobe_cutouts');
          if (up?.secureUrl) finalCleanedUrl = up.secureUrl;
        } catch (e) {}
      }
    }

    if (isDbConnected()) {
      try {
        const item = await ClothingItem.create({
          userId,
          name,
          category,
          subcategory,
          primaryColor,
          secondaryColors: secondaryColors || [],
          pattern: pattern || 'Solid',
          fabric,
          seasonality: seasonality || 'ALL_SEASON',
          brand,
          size,
          purchasePrice,
          purchaseDate,
          status: 'AVAILABLE',
          isFavorite: false,
          timesWorn: 0,
          imageUrl: finalImageUrl,
          cleanedImageUrl: finalCleanedUrl,
          aiAttributes: aiAttributes || {},
          notes,
        });

        res.status(201).json({
          success: true,
          message: 'Clothing item saved to wardrobe.',
          data: item,
        });
        return;
      } catch (err) {
        console.warn('[DB Error on createClothingItem]:', err);
      }
    }

    // Persistent disk storage
    const newItem = storageService.addWardrobeItem({
      userId,
      name,
      category,
      subcategory,
      primaryColor,
      secondaryColors: secondaryColors || [],
      pattern: pattern || 'Solid',
      fabric,
      seasonality: seasonality || 'ALL_SEASON',
      brand,
      size,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseDate,
      status: 'AVAILABLE',
      isFavorite: false,
      timesWorn: 0,
      imageUrl: finalImageUrl,
      cleanedImageUrl: finalCleanedUrl,
      aiAttributes: aiAttributes || {},
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Clothing item saved to wardrobe.',
      data: newItem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving clothing item.',
    });
  }
};

export const getClothingItems = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { category, status, isFavorite, search, sort } = req.query;

    if (isDbConnected()) {
      try {
        const filter: any = { userId, status: { $ne: 'ARCHIVED' } };

        if (category && category !== 'All' && category !== 'ALL') {
          filter.category = (category as string).toUpperCase();
        }
        if (status) filter.status = status;
        if (isFavorite === 'true') filter.isFavorite = true;
        if (search) {
          const regex = new RegExp(search as string, 'i');
          filter.$or = [
            { name: regex },
            { subcategory: regex },
            { brand: regex },
            { primaryColor: regex },
          ];
        }

        let sortQuery: any = { createdAt: -1 };
        if (sort === 'timesWorn') sortQuery = { timesWorn: -1 };
        else if (sort === 'priceAsc') sortQuery = { purchasePrice: 1 };
        else if (sort === 'priceDesc') sortQuery = { purchasePrice: -1 };

        const items = await ClothingItem.find(filter).sort(sortQuery);

        res.status(200).json({
          success: true,
          count: items.length,
          data: items,
        });
        return;
      } catch (err) {
        console.warn('[DB Error on getClothingItems]:', err);
      }
    }

    // Persistent disk storage fallback
    const userItems = storageService.getWardrobeItems(userId);

    let filtered = [...userItems];
    if (category && category !== 'All' && category !== 'ALL') {
      filtered = filtered.filter(
        (i) => i.category.toUpperCase() === (category as string).toUpperCase()
      );
    }
    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }
    if (isFavorite === 'true') {
      filtered = filtered.filter((i) => i.isFavorite);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.subcategory.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching wardrobe items.',
    });
  }
};

export const getClothingItemById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        const item = await ClothingItem.findOne({ _id: id, userId });
        if (item) {
          res.status(200).json({ success: true, data: item });
          return;
        }
      } catch (err) {}
    }

    const userItems = inMemoryWardrobe.get(userId) || [];
    const item = userItems.find((i) => i._id === id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found in your wardrobe.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching clothing item.',
    });
  }
};

export const updateClothingItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        const updated = await ClothingItem.findOneAndUpdate(
          { _id: id, userId },
          { $set: req.body },
          { new: true }
        );
        if (updated) {
          res.status(200).json({ success: true, message: 'Item updated.', data: updated });
          return;
        }
      } catch (err) {}
    }

    const userItems = inMemoryWardrobe.get(userId) || [];
    const idx = userItems.findIndex((i) => i._id === id);
    if (idx !== -1) {
      userItems[idx] = { ...userItems[idx], ...req.body };
      inMemoryWardrobe.set(userId, userItems);
      res.status(200).json({ success: true, message: 'Item updated.', data: userItems[idx] });
      return;
    }

    res.status(404).json({ success: false, message: 'Item not found.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating item.' });
  }
};

export const updateClothingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;
    const { status } = req.body;

    if (isDbConnected()) {
      try {
        const updated = await ClothingItem.findOneAndUpdate(
          { _id: id, userId },
          { $set: { status } },
          { new: true }
        );
        if (updated) {
          res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: updated });
          return;
        }
      } catch (err) {}
    }

    const userItems = inMemoryWardrobe.get(userId) || [];
    const idx = userItems.findIndex((i) => i._id === id);
    if (idx !== -1) {
      userItems[idx].status = status;
      inMemoryWardrobe.set(userId, userItems);
      res.status(200).json({ success: true, message: `Status updated to ${status}.`, data: userItems[idx] });
      return;
    }

    res.status(404).json({ success: false, message: 'Item not found.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating status.' });
  }
};

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        const item = await ClothingItem.findOne({ _id: id, userId });
        if (item) {
          item.isFavorite = !item.isFavorite;
          await item.save();
          res.status(200).json({ success: true, message: 'Favorite toggled.', data: item });
          return;
        }
      } catch (err) {}
    }

    const userItems = storageService.getWardrobeItems(userId);
    const item = userItems.find((i) => i._id === id);
    if (item) {
      const updated = storageService.updateWardrobeItem(id, userId, { isFavorite: !item.isFavorite });
      res.status(200).json({ success: true, message: 'Favorite toggled.', data: updated });
      return;
    }

    res.status(404).json({ success: false, message: 'Item not found.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error toggling favorite.' });
  }
};

export const deleteClothingItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        await ClothingItem.findOneAndDelete({ _id: id });
      } catch (err) {}
    }

    storageService.deleteWardrobeItem(id, userId);

    res.status(200).json({
      success: true,
      message: 'Clothing item deleted from your closet.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting item.' });
  }
};

export const seedStarterWardrobe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const items = userId ? storageService.getWardrobeItems(userId) : [];
  res.status(200).json({
    success: true,
    message: 'Wardrobe is dynamically managed by user uploads.',
    count: items.length,
    data: items,
  });
};
