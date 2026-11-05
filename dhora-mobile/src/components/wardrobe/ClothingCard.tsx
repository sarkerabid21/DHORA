import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Heart, Clock, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ClothingItem } from '../../types/clothing';
import { useThemeStore } from '../../stores/themeStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { Badge } from '../common/Badge';
import { RADIUS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 2 - SPACING.sm) / 2;

export interface ClothingCardProps {
  item: ClothingItem;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({ item }) => {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { toggleFavorite } = useWardrobeStore();

  const isLaundry = item.status === 'IN_LAUNDRY';
  const isUnavailable = item.status === 'UNAVAILABLE';

  const getStatusBadge = () => {
    if (isLaundry) {
      return <Badge label="In Laundry" variant="warning" />;
    }
    if (isUnavailable) {
      return <Badge label="Unavailable" variant="error" />;
    }
    return <Badge label="Available" variant="success" />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/item/${item._id}` as any)}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Image & Badges */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Favorite Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleFavorite(item._id)}
          style={[
            styles.favButton,
            {
              backgroundColor: item.isFavorite ? '#FEF2F2' : 'rgba(255,255,255,0.85)',
            },
          ]}
        >
          <Heart
            size={16}
            color={item.isFavorite ? '#EF4444' : '#52525B'}
            fill={item.isFavorite ? '#EF4444' : 'none'}
          />
        </TouchableOpacity>

        {/* Status Pill */}
        <View style={styles.statusPosition}>{getStatusBadge()}</View>
      </View>

      {/* Info Container */}
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.textPrimary }]}>
          {item.name}
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {item.brand || item.subcategory} • {item.primaryColor}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.wornRow}>
            <Clock size={11} color={theme.textTertiary} />
            <Text style={[styles.wornText, { color: theme.textTertiary }]}>
              {item.timesWorn} wears
            </Text>
          </View>

          {item.purchasePrice ? (
            <Text style={[styles.priceText, { color: theme.accent }]}>
              ৳{item.purchasePrice}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  imageWrapper: {
    width: '100%',
    height: 165,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  statusPosition: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  info: {
    padding: SPACING.sm + 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wornRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wornText: {
    fontSize: 10,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
