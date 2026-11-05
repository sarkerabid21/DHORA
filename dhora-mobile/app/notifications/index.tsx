import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  CheckCheck,
  CloudSun,
  Sparkles,
  Users,
  Repeat,
  Trash2,
  Tag,
  Calendar,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { AppNotification, NotificationType } from '../../src/types/notification';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useThemeStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'WEATHER_ALERT':
        return <CloudSun size={20} color="#F59E0B" />;
      case 'STYLING_TIP':
        return <Sparkles size={20} color={theme.accent} />;
      case 'COMMUNITY_BUY':
        return <Users size={20} color="#3B82F6" />;
      case 'RENTAL_UPDATE':
        return <Repeat size={20} color="#10B981" />;
      case 'PRICE_DROP':
        return <Tag size={20} color="#EF4444" />;
      case 'CALENDAR_REMINDER':
        return <Calendar size={20} color="#8B5CF6" />;
      default:
        return <Bell size={20} color={theme.accent} />;
    }
  };

  const handlePressItem = async (item: AppNotification) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }
    if (item.link) {
      router.push(item.link as any);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    return n.type === activeFilter;
  });

  const renderItem = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        activeOpacity={0.8}
        style={[
          styles.itemCard,
          {
            backgroundColor: item.isRead
              ? theme.surface
              : isDarkMode
              ? '#241E16'
              : '#FDFBF7',
            borderColor: item.isRead ? theme.border : theme.accent,
          },
        ]}
      >
        <View style={styles.iconBox}>{getNotificationIcon(item.type)}</View>

        <View style={{ flex: 1 }}>
          <View style={styles.itemHeader}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: theme.textPrimary,
                  fontWeight: item.isRead ? '600' : '800',
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />}
          </View>

          <Text style={[styles.itemMessage, { color: theme.textSecondary }]}>
            {item.message}
          </Text>

          <View style={styles.itemFooter}>
            <Text style={[styles.itemTime, { color: theme.textTertiary }]}>
              {new Date(item.createdAt).toLocaleDateString()} •{' '}
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <TouchableOpacity
              onPress={() => deleteNotification(item._id)}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.topBarTitle, { color: theme.textPrimary }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Badge label={`${unreadCount} New`} variant="accent" />
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <CheckCheck size={18} color={theme.accent} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'ALL', label: 'All' },
          { key: 'UNREAD', label: `Unread (${unreadCount})` },
          { key: 'STYLING_TIP', label: 'Styling' },
          { key: 'COMMUNITY_BUY', label: 'Group Buy' },
          { key: 'WEATHER_ALERT', label: 'Weather' },
        ].map((f) => {
          const isSelected = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {loading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={40} color={theme.accent} />}
              title="All Caught Up!"
              description="You have no notifications in this category. We'll alert you about daily outfit ideas and group orders."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  markAllBtn: {
    padding: 6,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTime: {
    fontSize: 11,
  },
  deleteBtn: {
    padding: 4,
  },
});
