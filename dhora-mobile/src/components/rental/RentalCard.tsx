import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ShieldCheck, Star } from 'lucide-react-native';
import { RentalListing } from '../../types/marketplace';
import { useThemeStore } from '../../stores/themeStore';
import { Badge } from '../common/Badge';
import { RADIUS, SPACING } from '../../constants/theme';

export interface RentalCardProps {
  listing: RentalListing;
}

export const RentalCard: React.FC<RentalCardProps> = ({ listing }) => {
  const router = useRouter();
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/rental/${listing._id}` as any)}
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: listing.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.conditionBadge}>
          <Badge
            label={listing.condition.replace('_', ' ')}
            variant={listing.condition === 'BRAND_NEW' ? 'success' : 'accent'}
          />
        </View>

        <View style={styles.ratingBadge}>
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>{listing.rating}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.textPrimary }]}>
          {listing.title}
        </Text>

        <Text style={[styles.sizeCategory, { color: theme.textSecondary }]}>
          Size: {listing.size} • {listing.category}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color={theme.accent} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>
            {listing.locationArea}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.textPrimary }]}>
            ৳{listing.dailyRentalPrice}
            <Text style={{ fontSize: 11, color: theme.textSecondary }}> / day</Text>
          </Text>
          <Text style={[styles.depositText, { color: theme.textTertiary }]}>
            Deposit: ৳{listing.securityDeposit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  conditionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sizeCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: SPACING.xs + 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  depositText: {
    fontSize: 11,
  },
});
