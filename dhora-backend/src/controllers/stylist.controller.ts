import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClothingItem } from '../models/clothingItem.model';
import { Outfit } from '../models/outfit.model';
import { OutfitFeedback } from '../models/outfitFeedback.model';
import { AIConversation } from '../models/aiConversation.model';
import { UserProfile } from '../models/userProfile.model';
import { UserStylePreference } from '../models/userStylePreference.model';
import { geminiService } from '../services/gemini.service';
import { weatherService } from '../services/weather.service';
import { storageService } from '../services/storage.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

// In-Memory stores for development fallback
const memConversations = new Map<string, { id: string; messages: any[] }>();
const memSavedLooks = new Map<string, any[]>();

const getUserAvailableItems = async (userId?: string): Promise<any[]> => {
  let items: any[] = [];
  if (isDbConnected()) {
    try {
      items = await ClothingItem.find({
        userId,
        status: 'AVAILABLE',
      });
    } catch (err) {
      // Ignore
    }
  } else {
    items = storageService.getWardrobeItems(userId || 'user_demo').filter(
      (i) => i.status === 'AVAILABLE'
    );
  }
  return items;
};

export const resolveOutfitModelImages = (
  items: Array<{ name?: string; category?: string; role?: string; pattern?: string; color?: string }>
) => {
  const text = items
    .map((i) => `${i.name || ''} ${i.role || ''} ${i.category || ''} ${i.pattern || ''} ${i.color || ''}`)
    .join(' ')
    .toLowerCase();

  // 1. Traditional Panjabi / Kurta
  if (
    text.includes('panjabi') ||
    text.includes('kurta') ||
    text.includes('pajama') ||
    text.includes('traditional')
  ) {
    return {
      modelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868915/dhora/models/model_male_panjabi.jpg',
      femaleModelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868703/dhora/models/model_female_navy_espresso.jpg',
    };
  }

  // 2. Cyan / Turquoise Blazer
  if (
    text.includes('cyan') ||
    text.includes('turquoise') ||
    (text.includes('blazer') && text.includes('cyan'))
  ) {
    return {
      modelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885534/dhora/models/model_male_cyan_blazer.jpg',
      femaleModelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885537/dhora/models/model_female_checkered_trousers.jpg',
    };
  }

  // 3. Cat Graphic Black T-Shirt ("Despise", "Cat", "Speechless")
  if (
    text.includes('cat') ||
    text.includes('despise') ||
    text.includes('speechless') ||
    (text.includes('graphic') && text.includes('black'))
  ) {
    return {
      modelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885532/dhora/models/model_male_cat_tee_jeans.jpg',
      femaleModelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885535/dhora/models/model_female_cat_tee_jeans.jpg',
    };
  }

  // 4. Blue Checkered Popover Shirt
  if (
    text.includes('checkered') ||
    text.includes('popover') ||
    text.includes('plaid') ||
    (text.includes('blue') && text.includes('check'))
  ) {
    return {
      modelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885533/dhora/models/model_male_checkered_trousers.jpg',
      femaleModelImageUrl:
        'https://res.cloudinary.com/gfxpemjc/image/upload/v1793885537/dhora/models/model_female_checkered_trousers.jpg',
    };
  }

  // 5. Default Navy / Classic
  return {
    modelImageUrl:
      'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868700/dhora/models/model_male_navy_espresso.jpg',
    femaleModelImageUrl:
      'https://res.cloudinary.com/gfxpemjc/image/upload/v1793868703/dhora/models/model_female_navy_espresso.jpg',
  };
};

export const generateOutfits = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { occasion } = req.body;

    const availableItems = await getUserAvailableItems(userId);

    if (availableItems.length < 2) {
      res.status(200).json({
        success: true,
        message: 'Add at least 2 clothes to your digital wardrobe to generate grounded AI outfits.',
        data: [],
      });
      return;
    }

    let profile: any = null;
    let prefs: any = null;
    if (isDbConnected()) {
      try {
        profile = await UserProfile.findOne({ userId });
        prefs = await UserStylePreference.findOne({ userId });
      } catch (err) {}
    }

    const weather = await weatherService.getWeatherForArea(
      profile?.locationArea || 'Dhaka'
    );

    const generated = await geminiService.generateOutfitsGrounded(
      availableItems,
      occasion || 'University & Daily Casual',
      weather,
      prefs
    );

    const itemMap = new Map(availableItems.map((i) => [i._id.toString(), i]));

    const populatedOutfits = generated.map((outfit) => {
      const populatedItems = outfit.items.map((it) => {
        const fullItem = itemMap.get(it.clothingItemId);
        return {
          clothingItemId: it.clothingItemId,
          role: it.role,
          name: fullItem?.name || 'Garment',
          category: fullItem?.category || 'TOPS',
          subcategory: fullItem?.subcategory || 'Item',
          color: fullItem?.primaryColor || 'Color',
          pattern: fullItem?.pattern,
          imageUrl: fullItem?.imageUrl || '',
          brand: fullItem?.brand,
        };
      });

      const models = resolveOutfitModelImages(populatedItems);

      return {
        ...outfit,
        modelImageUrl: models.modelImageUrl,
        femaleModelImageUrl: models.femaleModelImageUrl,
        items: populatedItems,
      };
    });

    res.status(200).json({
      success: true,
      data: populatedOutfits,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating outfit combinations.',
    });
  }
};

export const chatWithStylist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { message, conversationId } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }

    let conversation: any = null;
    let convId = conversationId || `conv_${Date.now()}`;

    if (isDbConnected()) {
      try {
        if (conversationId) {
          conversation = await AIConversation.findOne({ _id: conversationId, userId });
        }
        if (!conversation) {
          conversation = await AIConversation.create({
            userId,
            title: message.substring(0, 30),
            messages: [],
          });
        }
        convId = conversation._id.toString();
        conversation.messages.push({
          sender: 'USER',
          text: message,
          createdAt: new Date(),
        });
      } catch (err) {}
    }

    if (!conversation) {
      const existing: { id: string; messages: any[] } = memConversations.get(convId) || { id: convId, messages: [] };
      existing.messages.push({ sender: 'USER', text: message, createdAt: new Date() });
      memConversations.set(convId, existing);
      conversation = existing;
    }

    const availableItems = await getUserAvailableItems(userId);

    if (availableItems.length < 2) {
      const reply = `Assalamu Alaikum! I'm your DHORA AI Stylist. Your digital wardrobe currently has fewer than 2 items. Please tap "Add Clothes" to snap photos of your clothes, or load sample demo items. Once digitized, I can style real outfits grounded in your closet!`;
      conversation.messages.push({
        sender: 'ASSISTANT',
        text: reply,
        createdAt: new Date(),
      });
      res.status(200).json({
        success: true,
        data: {
          conversationId: convId,
          replyText: reply,
          suggestedOutfit: null,
        },
      });
      return;
    }

    let profile: any = null;
    if (isDbConnected()) {
      try {
        profile = await UserProfile.findOne({ userId });
      } catch (err) {}
    }

    const weather = await weatherService.getWeatherForArea(
      profile?.locationArea || 'Dhaka'
    );

    const result = await geminiService.chatStylist(
      conversation.messages.map((m: any) => ({ sender: m.sender, text: m.text })),
      message,
      availableItems,
      weather
    );

    const itemMap = new Map(availableItems.map((i) => [i._id.toString(), i]));

    let populatedOutfit = undefined;
    if (result.suggestedOutfit) {
      const populatedItems = result.suggestedOutfit.items.map((it: any) => {
        const fullItem = itemMap.get(it.clothingItemId);
        return {
          clothingItemId: it.clothingItemId,
          role: it.role,
          name: fullItem?.name || 'Garment',
          category: fullItem?.category || 'TOPS',
          subcategory: fullItem?.subcategory || 'Item',
          color: fullItem?.primaryColor || 'Color',
          pattern: fullItem?.pattern,
          imageUrl: fullItem?.imageUrl || '',
          brand: fullItem?.brand,
        };
      });

      const models = resolveOutfitModelImages(populatedItems);

      populatedOutfit = {
        ...result.suggestedOutfit,
        modelImageUrl: models.modelImageUrl,
        femaleModelImageUrl: models.femaleModelImageUrl,
        items: populatedItems,
      };
    }

    if (isDbConnected() && typeof conversation.save === 'function') {
      try {
        conversation.messages.push({
          sender: 'AI',
          text: result.replyText,
          suggestedOutfitId: undefined,
          createdAt: new Date(),
        });
        await conversation.save();
      } catch (err) {}
    } else {
      conversation.messages.push({
        sender: 'AI',
        text: result.replyText,
        createdAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        conversationId: convId,
        replyText: result.replyText,
        suggestedOutfit: populatedOutfit,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error communicating with AI Stylist.',
    });
  }
};

export const saveOutfit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { title, occasion, rationale, items, weatherSuitability } = req.body;

    if (!title || !occasion || !items || !items.length) {
      res.status(400).json({
        success: false,
        message: 'Missing required outfit fields.',
      });
      return;
    }

    if (isDbConnected()) {
      try {
        const saved = await Outfit.create({
          userId,
          title,
          occasion,
          rationale: rationale || 'Handpicked favorite look.',
          items: items.map((it: any) => ({
            clothingItemId: it.clothingItemId,
            role: it.role,
          })),
          weatherSuitability,
          isAiGenerated: true,
          isFavorite: true,
        });

        res.status(201).json({
          success: true,
          message: 'Outfit saved to your Looks collection.',
          data: saved,
        });
        return;
      } catch (err) {}
    }

    // Persistent disk storage
    const newLook = storageService.saveOutfit(userId, {
      title,
      occasion,
      rationale: rationale || 'Handpicked look.',
      items,
      weatherSuitability,
      isAiGenerated: true,
      isFavorite: true,
    });

    res.status(201).json({
      success: true,
      message: 'Outfit saved to your Looks collection.',
      data: newLook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving outfit.',
    });
  }
};

export const getSavedOutfits = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';

    if (isDbConnected()) {
      try {
        const outfits = await Outfit.find({ userId })
          .populate('items.clothingItemId')
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: outfits,
        });
        return;
      } catch (err) {}
    }

    const outfits = storageService.getSavedOutfits(userId);
    res.status(200).json({
      success: true,
      data: outfits,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching saved looks.',
    });
  }
};

export const deleteSavedOutfit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const id = req.params.id as string;

    if (isDbConnected()) {
      try {
        await Outfit.findOneAndDelete({ _id: id, userId });
      } catch (err) {}
    }

    storageService.unsaveOutfit(id, userId);

    res.status(200).json({
      success: true,
      message: 'Outfit removed from saved looks.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting saved outfit.',
    });
  }
};

export const submitOutfitFeedback = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    const { outfitId, rating, feedbackReason, comment } = req.body;

    if (isDbConnected()) {
      try {
        await OutfitFeedback.create({
          userId,
          outfitId,
          rating,
          feedbackReason,
          comment,
        });
      } catch (err) {}
    }

    res.status(201).json({
      success: true,
      message: 'Feedback recorded. AI will adapt your future recommendations.',
      data: { rating, feedbackReason },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting feedback.',
    });
  }
};

export const getTodayWeatherOutfit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId || 'user_demo';
    let profile: any = null;

    if (isDbConnected()) {
      try {
        profile = await UserProfile.findOne({ userId });
      } catch (err) {}
    }

    const weather = await weatherService.getWeatherForArea(
      profile?.locationArea || 'Dhaka'
    );

    const availableItems = await getUserAvailableItems(userId);
    let todayOutfit = null;

    if (availableItems.length >= 2) {
      const generated = await geminiService.generateOutfitsGrounded(
        availableItems,
        'Daily Weather Recommendation',
        weather
      );

      if (generated.length > 0) {
        const itemMap = new Map(availableItems.map((i) => [i._id.toString(), i]));
        const populatedItems = generated[0].items.map((it) => {
          const fullItem = itemMap.get(it.clothingItemId);
          return {
            clothingItemId: it.clothingItemId,
            role: it.role,
            name: fullItem?.name || 'Garment',
            category: fullItem?.category || 'TOPS',
            subcategory: fullItem?.subcategory || 'Item',
            color: fullItem?.primaryColor || 'Color',
            pattern: fullItem?.pattern,
            imageUrl: fullItem?.imageUrl || '',
            brand: fullItem?.brand,
          };
        });

        const models = resolveOutfitModelImages(populatedItems);

        todayOutfit = {
          ...generated[0],
          modelImageUrl: models.modelImageUrl,
          femaleModelImageUrl: models.femaleModelImageUrl,
          items: populatedItems,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        weather,
        outfit: todayOutfit,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving weather styling.',
    });
  }
};
