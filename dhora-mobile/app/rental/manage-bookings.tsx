import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useRentalStore } from '../../src/stores/rentalStore';
import { BookingStepper } from '../../src/components/rental/BookingStepper';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { BookingStatus, RentalListing } from '../../src/types/marketplace';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function ManageBookingsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { bookings, updateBookingStatus, submitConditionReport } = useRentalStore();

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [conditionStage, setConditionStage] = useState<'PRE_RENTAL_DISPATCH' | 'POST_RENTAL_RETURN'>('PRE_RENTAL_DISPATCH');
  const [inspectionNotes, setInspectionNotes] = useState('Hem, zipper, and fabric inspected in flawless condition.');

  const handleNextStatus = (bookingId: string, currentStatus: BookingStatus) => {
    let nextStatus: BookingStatus = currentStatus;
    switch (currentStatus) {
      case 'PENDING':
        nextStatus = 'CONFIRMED';
        break;
      case 'CONFIRMED':
        nextStatus = 'OUT_FOR_DELIVERY';
        break;
      case 'OUT_FOR_DELIVERY':
        nextStatus = 'ACTIVE';
        break;
      case 'ACTIVE':
        nextStatus = 'RETURN_REQUESTED';
        break;
      case 'RETURN_REQUESTED':
        nextStatus = 'UNDER_INSPECTION';
        break;
      case 'UNDER_INSPECTION':
        nextStatus = 'COMPLETED';
        break;
    }

    updateBookingStatus(bookingId, nextStatus);
    Alert.alert('Status Updated', `Booking has moved to: ${nextStatus.replace(/_/g, ' ')}`);
  };

  const handleOpenInspection = (bookingId: string, stage: 'PRE_RENTAL_DISPATCH' | 'POST_RENTAL_RETURN') => {
    setSelectedBookingId(bookingId);
    setConditionStage(stage);
    setConditionModalOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedBookingId) return;

    await submitConditionReport({
      bookingId: selectedBookingId,
      stage: conditionStage,
      photos: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
      notes: inspectionNotes,
    });

    setConditionModalOpen(false);
    Alert.alert(
      'Inspection Photo Logged ✅',
      'Condition report and timestamps stored securely in escrow audit trail.'
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Rental Bookings & Escrow
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {bookings.length} active and historical rentals
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((booking) => {
          const listing = booking.listingId as RentalListing;
          return (
            <Card key={booking._id} style={styles.bookingCard}>
              {/* Status Header */}
              <View style={styles.bookingHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bookingTitle, { color: theme.textPrimary }]}>
                    {listing?.title || 'Heritage Silk Rental'}
                  </Text>
                  <Text style={[styles.bookingDates, { color: theme.textSecondary }]}>
                    {booking.startDate} to {booking.endDate} ({booking.totalDays} Days)
                  </Text>
                </View>

                <Badge
                  label={booking.status.replace(/_/g, ' ')}
                  variant={booking.status === 'COMPLETED' ? 'success' : 'accent'}
                />
              </View>

              {/* 7-Stage Workflow Progress Stepper */}
              <BookingStepper status={booking.status} />

              {/* Financial Escrow Details */}
              <View style={[styles.escrowSummary, { backgroundColor: theme.surfaceVariant }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Rental Fee
                  </Text>
                  <Text style={[styles.summaryVal, { color: theme.textPrimary }]}>
                    ৳{booking.rentalFee}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Security Deposit
                  </Text>
                  <Text style={[styles.summaryVal, { color: '#059669' }]}>
                    ৳{booking.depositFee}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Total Escrow
                  </Text>
                  <Text style={[styles.summaryVal, { color: theme.accent }]}>
                    ৳{booking.totalAmount}
                  </Text>
                </View>
              </View>

              {/* Action Controls for Status Advancement */}
              <View style={styles.actionRow}>
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <Button
                    title={`Advance to: ${
                      booking.status === 'PENDING'
                        ? 'Confirm'
                        : booking.status === 'CONFIRMED'
                        ? 'Dispatch'
                        : booking.status === 'OUT_FOR_DELIVERY'
                        ? 'Active'
                        : booking.status === 'ACTIVE'
                        ? 'Return'
                        : booking.status === 'RETURN_REQUESTED'
                        ? 'Inspect'
                        : 'Complete'
                    }`}
                    variant="accent"
                    size="sm"
                    onPress={() => handleNextStatus(booking._id, booking.status)}
                    style={{ flex: 1 }}
                  />
                )}

                <Button
                  title="Condition Photos"
                  variant="outline"
                  size="sm"
                  icon={<Camera size={15} color={theme.textPrimary} />}
                  onPress={() =>
                    handleOpenInspection(
                      booking._id,
                      booking.status === 'UNDER_INSPECTION'
                        ? 'POST_RENTAL_RETURN'
                        : 'PRE_RENTAL_DISPATCH'
                    )
                  }
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Condition Inspection Modal */}
      <Modal visible={conditionModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Condition Inspection Report
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {conditionStage === 'PRE_RENTAL_DISPATCH'
                    ? 'Pre-Dispatch Handover Photos'
                    : 'Post-Rental Return Inspection Photos'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setConditionModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
              >
                <X size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.photoBox, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
              <Camera size={32} color={theme.accent} />
              <Text style={[styles.photoBoxText, { color: theme.textSecondary }]}>
                Front, Back & Hem Photo Attached
              </Text>
              <Badge label="Sample Photos Verified" variant="success" style={{ marginTop: 6 }} />
            </View>

            <Input
              label="Inspection Notes"
              value={inspectionNotes}
              onChangeText={setInspectionNotes}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Save Condition Report to Escrow"
              variant="accent"
              size="lg"
              onPress={handleSubmitReport}
              icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  bookingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bookingDates: {
    fontSize: 12,
    marginTop: 2,
  },
  escrowSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBox: {
    height: 120,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  photoBoxText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
