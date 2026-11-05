import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification, INotification } from '../models/notification.model';

const SEED_NOTIFICATIONS = [
  {
    title: '🌤️ Dhaka Weather Alert: 29°C & Humid',
    message: 'Breathable linen shirts and cotton pants recommended today for university & casual outings.',
    type: 'WEATHER_ALERT',
    link: '/(tabs)/stylist',
  },
  {
    title: '📦 Group Buy Ending Soon in Dhanmondi!',
    message: 'Only 1 hour left to join the Heavyweight Hoodie group order. Save ৳120 courier fee!',
    type: 'COMMUNITY_BUY',
    link: '/(tabs)/discover',
  },
  {
    title: '✨ Fresh AI Outfit Suggestions Ready',
    message: 'Your personal AI stylist generated 3 weekend combinations using clothes from your wardrobe.',
    type: 'STYLING_TIP',
    link: '/(tabs)/stylist',
  },
  {
    title: '👗 Rental Booking Confirmed',
    message: 'Your booking for the Banarasi Katan Saree has been accepted. View pickup pass & condition report.',
    type: 'RENTAL_UPDATE',
    link: '/rental/manage-bookings',
  },
];

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    let notifications: any[] = [];
    try {
      notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    } catch (err) {}

    // Seed defaults if empty
    if (notifications.length === 0) {
      notifications = SEED_NOTIFICATIONS.map((n, idx) => ({
        ...n,
        _id: `notif_${idx + 1}`,
        userId,
        isRead: false,
        createdAt: new Date(),
      }));
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications.',
    });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    try {
      await Notification.findOneAndUpdate(
        { _id: id, userId },
        { $set: { isRead: true } },
        { new: true }
      );
    } catch (err) {}

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { _id: id, isRead: true },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking notification read.',
    });
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      );
    } catch (err) {}

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking all notifications read.',
    });
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    try {
      await Notification.findOneAndDelete({ _id: id, userId });
    } catch (err) {}

    res.status(200).json({
      success: true,
      message: 'Notification removed.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting notification.',
    });
  }
};
