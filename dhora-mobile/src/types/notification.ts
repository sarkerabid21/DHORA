export type NotificationType =
  | 'WEATHER_ALERT'
  | 'RENTAL_UPDATE'
  | 'COMMUNITY_BUY'
  | 'STYLING_TIP'
  | 'PRICE_DROP'
  | 'CALENDAR_REMINDER';

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
