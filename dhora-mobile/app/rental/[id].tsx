import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useRentalStore } from '../../src/stores/rentalStore';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const { listings, createBooking } = useRentalStore();

  const listing = listings.find((l) => l._id === id) || listings[0];

  const [rentalDays, setRentalDays] = useState(2);
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'COURIER'>('PICKUP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentalFee = rentalDays * listing.dailyRentalPrice;
  const depositFee = listing.securityDeposit;
  const totalAmount = rentalFee + depositFee;

  const handleBook = async () => {
    setIsSubmitting(true);
    const startDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const endDate = new Date(Date.now() + (rentalDays + 1) * 86400000)
      .toISOString()
      .split('T')[0];

    await createBooking({
      listingId: listing._id,
      startDate,
      endDate,
      deliveryMethod,
      renterNotes: 'Booking for festive event',
    });

    setIsSubmitting(false);

    Alert.alert(
      'Booking Request Submitted! 👗',
      `Your request for ${rentalDays} days (৳${totalAmount.toLocaleString()} including refundable deposit) has been sent to the owner for approval.`,
      [
        {
          text: 'Manage Bookings',
          onPress: () => router.push('/rental/manage-bookings' as any),
        },
        { text: 'OK', onPress: () => router.back() },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Floating Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: theme.surface }]}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Main Photo Gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: listing.images[0] }} style={styles.image} resizeMode="cover" />
          <View style={styles.badgeOverlay}>
            <Badge
              label={listing.condition.replace('_', ' ')}
              variant={listing.condition === 'BRAND_NEW' ? 'success' : 'accent'}
            />
          </View>
        </View>

        {/* Content Details */}
        <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
          {/* Header Row */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {listing.title}
          </Text>

          <View style={styles.ratingLocationRow}>
            <View style={styles.ratingRow}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
                {listing.rating} ({listing.reviewsCount} rentals)
              </Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={13} color={theme.accent} />
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                {listing.locationArea}
              </Text>
            </View>
          </View>

          {/* Pricing Banner */}
          <View style={[styles.pricingBanner, { backgroundColor: theme.surfaceVariant }]}>
            <View>
              <Text style={[styles.dailyRate, { color: theme.accent }]}>
                ৳{listing.dailyRentalPrice}{' '}
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>/ day</Text>
              </Text>
              <Text style={[styles.depositNote, { color: theme.textTertiary }]}>
                Security Deposit: ৳{listing.securityDeposit.toLocaleString()} (100% Refundable)
              </Text>
            </View>
            <Badge label={`Min ${listing.minRentalDays} Days`} variant="default" />
          </View>

          {/* Specs Grid */}
          <View style={styles.specsRow}>
            <View style={[styles.specBox, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Size</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{listing.size}</Text>
            </View>
            <View style={[styles.specBox, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Category</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{listing.category}</Text>
            </View>
            <View style={[styles.specBox, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Max Days</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{listing.maxRentalDays} Days</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            About This Piece
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {listing.description}
          </Text>

          {/* Pickup Point Instructions */}
          <View style={[styles.pickupBox, { backgroundColor: theme.surfaceVariant }]}>
            <MapPin size={16} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pickupTitle, { color: theme.textPrimary }]}>
                Pickup & Handover Point:
              </Text>
              <Text style={[styles.pickupSub, { color: theme.textSecondary }]}>
                {listing.pickupAddressInstruction}
              </Text>
            </View>
          </View>

          {/* Rental Duration Selector */}
          <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: SPACING.md }]}>
            Select Rental Duration
          </Text>
          <View style={styles.durationSelector}>
            {[2, 3, 4, 5, 7].map((days) => {
              const isSelected = rentalDays === days;
              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => setRentalDays(days)}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: isSelected
                        ? theme.textPrimary
                        : theme.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {days} Days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Deposit & Escrow Safety Disclosure per Section 18 */}
          <Card style={styles.escrowCard}>
            <View style={styles.escrowRow}>
              <ShieldCheck size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.escrowTitle}>DHORA Escrow Protection Policy</Text>
                <Text style={styles.escrowText}>
                  Your security deposit (৳{depositFee.toLocaleString()}) is held safely. Both parties submit photo condition reports before handover and after return. The deposit is automatically refunded upon inspection completion.
                </Text>
              </View>
            </View>
          </Card>

          {/* Price Breakdown Summary */}
          <View style={styles.priceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={{ color: theme.textSecondary }}>
                Rental Fee ({rentalDays} days × ৳{listing.dailyRentalPrice})
              </Text>
              <Text style={{ fontWeight: '600', color: theme.textPrimary }}>
                ৳{rentalFee.toLocaleString()}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={{ color: theme.textSecondary }}>
                Refundable Security Deposit
              </Text>
              <Text style={{ fontWeight: '600', color: '#059669' }}>
                ৳{depositFee.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>
                Total Initial Escrow
              </Text>
              <Text style={[styles.totalAmount, { color: theme.accent }]}>
                ৳{totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Booking Action Button */}
          <Button
            title={isSubmitting ? 'Submitting Request...' : `Request Rental (${rentalDays} Days)`}
            variant="accent"
            size="lg"
            loading={isSubmitting}
            onPress={handleBook}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNav: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 360,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
  },
  contentCard: {
    marginTop: -16,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  pricingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  dailyRate: {
    fontSize: 20,
    fontWeight: '800',
  },
  depositNote: {
    fontSize: 11,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  specBox: {
    flex: 1,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  pickupBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  pickupTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  pickupSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  escrowCard: {
    padding: SPACING.md,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    marginBottom: SPACING.md,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  escrowText: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  priceBreakdown: {
    marginVertical: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
});
