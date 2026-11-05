import { Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { CommunityBuyPost, ICommunityBuyPost } from '../models/communityBuyPost.model';
import { CommunityBuyOrder } from '../models/communityBuyOrder.model';
import { UserProfile } from '../models/userProfile.model';
import { storageService } from '../services/storage.service';

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

const SEED_GROUP_BUYS = [
  {
    productName: 'Oversized 260 GSM Heavyweight Hoodie',
    productUrl: 'https://klothe.com/hoodies/heavyweight-black',
    productImageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
    unitPrice: 1450,
    deliverySavingPerPerson: 120,
    targetArea: 'Dhaka (Dhanmondi)',
    publicPickupLocation: 'Dhanmondi 27 Rapa Plaza Main Entrance (Near Coffee Glory)',
    pickupInstructions: 'Meet at agreed public cafe front. Bring your collection code on your phone.',
    availableSizes: ['M', 'L', 'XL'],
    availableColors: ['Charcoal Black', 'Heather Grey', 'Forest Green'],
    closingDurationMinutes: 180, // 3 hours
    maxParticipants: 8,
    minParticipantsRequired: 3,
    confirmedOrdersCount: 4,
    commentsCount: 6,
  },
  {
    productName: 'Minimalist Breathable Drop-Cut Polo',
    productUrl: 'https://sailor.clothing/polo',
    productImageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
    unitPrice: 950,
    deliverySavingPerPerson: 90,
    targetArea: 'Dhaka (DU Campus)',
    publicPickupLocation: 'Curzon Hall Main Gate (Faculty of Science)',
    pickupInstructions: 'After 3:00 PM on Friday. Contact via in-app group buy thread.',
    availableSizes: ['S', 'M', 'L'],
    availableColors: ['Navy Blue', 'Off-White', 'Black'],
    closingDurationMinutes: 90, // 1.5 hours
    maxParticipants: 6,
    minParticipantsRequired: 2,
    confirmedOrdersCount: 3,
    commentsCount: 4,
  },
  {
    productName: 'Tailored Smart Chinos - Khaki & Olive',
    productUrl: 'https://yellow.com/chinos',
    productImageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
    unitPrice: 1750,
    deliverySavingPerPerson: 110,
    targetArea: 'Dhaka (Gulshan)',
    publicPickupLocation: 'Gulshan 2 DCC Market North Gate',
    pickupInstructions: 'Collection between 5 PM and 7 PM on weekend.',
    availableSizes: ['30', '32', '34', '36'],
    availableColors: ['Khaki', 'Olive', 'Charcoal'],
    closingDurationMinutes: 360, // 6 hours
    maxParticipants: 5,
    minParticipantsRequired: 2,
    confirmedOrdersCount: 2,
    commentsCount: 3,
  },
];

export const getCommunityBuyFeed = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetArea } = req.query;
    const now = new Date();

    if (isDbConnected()) {
      try {
        // 1. Auto-close posts whose closingAt timestamp has elapsed
        await CommunityBuyPost.updateMany(
          { closingAt: { $lte: now }, status: { $in: ['OPEN', 'CLOSING_SOON'] } },
          { $set: { status: 'ORDER_CLOSED' } }
        );

        // 2. Fetch active and recently closed posts
        let query: any = {};
        if (targetArea) {
          query.targetArea = new RegExp(targetArea as string, 'i');
        }

        let posts = await CommunityBuyPost.find(query)
          .populate('creatorId', 'email')
          .sort({ createdAt: -1 });

        // Seed sample group buys if collection is empty
        if (posts.length === 0 && !targetArea) {
          const firstUser = req.user?.userId;
          if (firstUser) {
            await CommunityBuyPost.insertMany(
              SEED_GROUP_BUYS.map((b) => ({
                ...b,
                creatorId: firstUser,
                closingAt: new Date(Date.now() + b.closingDurationMinutes * 60000),
                status: 'OPEN',
              }))
            );
            posts = await CommunityBuyPost.find().sort({ createdAt: -1 });
          }
        }

        res.status(200).json({
          success: true,
          count: posts.length,
          data: posts,
        });
        return;
      } catch (dbErr) {}
    }

    // Resilient local mode with persisted posts
    let seedPosts = SEED_GROUP_BUYS.map((b, idx) => ({
      _id: `post_group_${idx + 1}`,
      ...b,
      creatorId: { _id: 'user_lead', email: 'lead@dhora.fashion' },
      closingAt: new Date(Date.now() + b.closingDurationMinutes * 60000),
      status: 'OPEN',
      createdAt: new Date(),
    }));

    const userPosts = storageService.getCommunityPosts(targetArea as string);
    let posts = [...userPosts, ...seedPosts];

    if (targetArea) {
      posts = posts.filter((p) =>
        p.targetArea?.toLowerCase().includes((targetArea as string).toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching Community Buy feed.',
    });
  }
};

export const getCommunityBuyPostById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await CommunityBuyPost.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Group order post not found.' });
      return;
    }

    const creatorProfile = await UserProfile.findOne({ userId: post.creatorId });
    const orders = await CommunityBuyOrder.find({ postId: id })
      .select('size color quantity status createdAt pickupUniqueCode participantId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        post,
        creator: {
          fullName: creatorProfile?.fullName || 'Community Host',
          locationArea: creatorProfile?.locationArea || post.targetArea,
          avatarUrl: creatorProfile?.avatarUrl,
        },
        ordersCount: orders.length,
        orders,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching group order details.',
    });
  }
};

export const createCommunityBuyPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const creatorId = req.user?.userId;
    const {
      productName,
      productUrl,
      productImageUrl,
      unitPrice,
      deliverySavingPerPerson,
      targetArea,
      publicPickupLocation,
      pickupInstructions,
      availableSizes,
      availableColors,
      durationMinutes,
      maxParticipants,
    } = req.body;

    if (
      !productName ||
      !productImageUrl ||
      !unitPrice ||
      !targetArea ||
      !publicPickupLocation ||
      !durationMinutes
    ) {
      res.status(400).json({
        success: false,
        message: 'Product info, price, target area, public pickup venue, and closing duration are required.',
      });
      return;
    }

    const duration = parseInt(durationMinutes, 10) || 120;
    const closingAt = new Date(Date.now() + duration * 60000);

    let post: any = null;
    if (isDbConnected()) {
      try {
        post = await CommunityBuyPost.create({
          creatorId,
          productName,
          productUrl,
          productImageUrl,
          unitPrice: Number(unitPrice),
          deliverySavingPerPerson: Number(deliverySavingPerPerson) || 120,
          targetArea,
          publicPickupLocation,
          pickupInstructions,
          availableSizes: availableSizes || ['S', 'M', 'L', 'XL'],
          availableColors: availableColors || ['Black', 'Navy', 'White'],
          closingAt,
          status: 'OPEN',
          maxParticipants: Number(maxParticipants) || 8,
          confirmedOrdersCount: 1, // Creator starts the order
        });
      } catch (err) {}
    }

    if (!post) {
      post = storageService.saveCommunityPost({
        creatorId: { _id: creatorId, email: req.user?.email || 'host@dhora.fashion' },
        productName,
        productUrl,
        productImageUrl,
        unitPrice: Number(unitPrice),
        deliverySavingPerPerson: Number(deliverySavingPerPerson) || 120,
        targetArea,
        publicPickupLocation,
        pickupInstructions,
        availableSizes: availableSizes || ['S', 'M', 'L', 'XL'],
        availableColors: availableColors || ['Black', 'Navy', 'White'],
        closingAt: closingAt.toISOString(),
        status: 'OPEN',
        maxParticipants: Number(maxParticipants) || 8,
        confirmedOrdersCount: 1,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Community Buy group order launched successfully.',
      data: post,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating group order post.',
    });
  }
};

export const joinCommunityBuyOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const participantId = req.user?.userId;
    const { id } = req.params;
    const { size, color, quantity, contactPhone } = req.body;

    if (!size || !color || !contactPhone) {
      res.status(400).json({
        success: false,
        message: 'Size, color, and contact phone are required to join order.',
      });
      return;
    }

    const post = await CommunityBuyPost.findById(id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Group order not found.' });
      return;
    }

    // STRICT INVARIANT: Cannot join if order is closed or timestamp passed
    if (new Date() >= new Date(post.closingAt)) {
      post.status = 'ORDER_CLOSED';
      await post.save();
      res.status(400).json({
        success: false,
        message: 'The countdown has ended. This group order is now closed.',
      });
      return;
    }

    if (post.status !== 'OPEN' && post.status !== 'CLOSING_SOON') {
      res.status(400).json({
        success: false,
        message: `This order is currently ${post.status.replace(/_/g, ' ')}. No new participants accepted.`,
      });
      return;
    }

    if (post.confirmedOrdersCount >= post.maxParticipants) {
      res.status(400).json({
        success: false,
        message: 'This group buy order has reached its maximum participant limit.',
      });
      return;
    }

    // Generate unique verifiable collection code: e.g. "DHR-7842-M"
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const suffix = size.slice(0, 1).toUpperCase();
    const pickupUniqueCode = `DHR-${randomHex}-${suffix}`;

    const qty = parseInt(quantity, 10) || 1;
    const totalPrice = qty * post.unitPrice;

    const order = await CommunityBuyOrder.create({
      postId: post._id,
      participantId,
      size,
      color,
      quantity: qty,
      unitPrice: post.unitPrice,
      totalPrice,
      contactPhone,
      pickupUniqueCode,
      status: 'PLACED',
    });

    // Increment confirmed orders count
    post.confirmedOrdersCount += 1;
    await post.save();

    res.status(201).json({
      success: true,
      message: 'You have joined the group order! Your unique pickup code has been generated.',
      data: {
        order,
        pickupInstructions: post.pickupInstructions,
        publicPickupLocation: post.publicPickupLocation,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining group buy order.',
    });
  }
};

export const getMyCommunityBuyOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const participantId = req.user?.userId;
    const orders = await CommunityBuyOrder.find({ participantId })
      .populate('postId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user group orders.',
    });
  }
};

export const updateCommunityBuyStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    const post = await CommunityBuyPost.findById(id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Group order post not found.' });
      return;
    }

    if (post.creatorId.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the creator can update the combined order workflow status.',
      });
      return;
    }

    post.status = status;
    await post.save();

    // If marked ready for pickup, update all placed orders to READY
    if (status === 'READY_FOR_PICKUP') {
      await CommunityBuyOrder.updateMany(
        { postId: id, status: { $in: ['PLACED', 'PAID'] } },
        { $set: { status: 'READY' } }
      );
    }

    res.status(200).json({
      success: true,
      message: `Group order status updated to ${status}.`,
      data: post,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status.',
    });
  }
};

export const verifyPickupCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { pickupCode } = req.body;

    if (!pickupCode) {
      res.status(400).json({ success: false, message: 'Pickup code is required.' });
      return;
    }

    const order = await CommunityBuyOrder.findOne({
      pickupUniqueCode: pickupCode.trim().toUpperCase(),
    }).populate('postId');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Invalid collection code. No matching order found.',
      });
      return;
    }

    if (order.status === 'COLLECTED') {
      res.status(400).json({
        success: false,
        message: 'This order was already collected and verified.',
      });
      return;
    }

    order.status = 'COLLECTED';
    order.collectedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Item handoff verified! Order successfully completed.',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying collection code.',
    });
  }
};
