import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { usePlannerStore } from '../../src/stores/plannerStore';
import { useStylistStore } from '../../src/stores/stylistStore';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { TopNavbar } from '../../src/components/common/TopNavbar';
import { GroundedOutfit } from '../../src/types/stylist';
import { SPACING, RADIUS } from '../../src/constants/theme';

const generateRollingDays = () => {
  const result = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = daysOfWeek[d.getDay()];
    const date = d.getDate().toString();
    const full = d.toISOString().split('T')[0];
    result.push({ day, date, full });
  }
  return result;
};

export default function PlannerScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const DAYS = React.useMemo(() => generateRollingDays(), []);
  const {
    events,
    selectedDate,
    setSelectedDate,
    confirmWorn,
    deleteEvent,
    planOutfit,
    fetchEvents,
  } = usePlannerStore();
  const { savedLooks } = useStylistStore();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedOutfitToSchedule, setSelectedOutfitToSchedule] =
    useState<GroundedOutfit | null>(null);
  const [occasionInput, setOccasionInput] = useState('Campus Class');

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventForSelectedDate = events.find((e) => e.date === selectedDate);

  const handleConfirmWorn = (eventId: string) => {
    confirmWorn(eventId);
    Alert.alert(
      'Outfit Marked as Worn! 🎉',
      'Wear count updated. Your cost-per-wear stats and wardrobe usage logs have been refreshed.'
    );
  };

  const handleScheduleOutfit = async () => {
    if (!selectedOutfitToSchedule) return;

    await planOutfit(
      selectedOutfitToSchedule,
      selectedDate,
      occasionInput || selectedOutfitToSchedule.occasion
    );

    setIsScheduleModalOpen(false);
    setSelectedOutfitToSchedule(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Universal DHORA Top Navigation Bar */}
      <TopNavbar subtitle="Outfit Planner & Calendar" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Outfit Planner
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Schedule your clothing in advance and avoid morning rush
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsScheduleModalOpen(true)}
          style={[styles.addFab, { backgroundColor: theme.accent }]}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Date Strip */}
      <View style={styles.dateStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateStrip}
        >
          {DAYS.map((d) => {
            const isSelected = selectedDate === d.full;
            const hasEvent = events.some((e) => e.date === d.full);

            return (
              <TouchableOpacity
                key={d.full}
                onPress={() => setSelectedDate(d.full)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {d.day}
                </Text>
                <Text
                  style={[
                    styles.dateText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {d.date}
                </Text>

                {hasEvent && (
                  <View
                    style={[
                      styles.eventDot,
                      {
                        backgroundColor: isSelected
                          ? '#FFFFFF'
                          : theme.accent,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Planned Outfit Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Planned Outfit for {selectedDate}
          </Text>
          {eventForSelectedDate && (
            <Badge
              label={
                eventForSelectedDate.isWornConfirmed
                  ? 'Worn & Recorded'
                  : 'Scheduled'
              }
              variant={
                eventForSelectedDate.isWornConfirmed ? 'success' : 'accent'
              }
            />
          )}
        </View>

        {eventForSelectedDate ? (
          <Card style={styles.card}>
            <View style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventTitle, { color: theme.textPrimary }]}>
                  {eventForSelectedDate.occasionName}
                </Text>
                <Text style={[styles.eventSub, { color: theme.accent }]}>
                  {eventForSelectedDate.outfitId.title}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => deleteEvent(eventForSelectedDate._id)}
                style={[styles.deleteBtn, { backgroundColor: theme.surfaceVariant }]}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Laundry Conflict Alert */}
            {eventForSelectedDate.hasLaundryConflict && (
              <View style={styles.laundryWarningBox}>
                <AlertTriangle size={16} color="#D97706" />
                <Text style={styles.laundryWarningText}>
                  Caution: Item ({eventForSelectedDate.conflictingItems?.join(', ')}) is currently in laundry!
                </Text>
              </View>
            )}

            {/* Outfit Items Grid */}
            <View style={styles.itemsRow}>
              {eventForSelectedDate.outfitId.items.map((it, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.itemCard,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                >
                  <Image
                    source={{ uri: it.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1} style={[styles.itemName, { color: theme.textPrimary }]}>
                    {it.name}
                  </Text>
                  <Text style={[styles.itemRole, { color: theme.textSecondary }]}>
                    {it.role}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action Row */}
            <View style={styles.actionRow}>
              {!eventForSelectedDate.isWornConfirmed ? (
                <Button
                  title="Mark as Worn Today"
                  variant="accent"
                  size="md"
                  icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                  onPress={() => handleConfirmWorn(eventForSelectedDate._id)}
                  style={{ flex: 1 }}
                />
              ) : (
                <View style={styles.confirmedRow}>
                  <CheckCircle2 size={16} color="#059669" />
                  <Text style={styles.confirmedText}>
                    Logged into wardrobe usage history
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <CalendarIcon size={32} color={theme.accent} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Outfit Planned for this Day
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Assign a look from your saved collection to stay effortlessly organized.
            </Text>
            <Button
              title="Plan an Outfit"
              variant="accent"
              size="sm"
              onPress={() => setIsScheduleModalOpen(true)}
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        )}

        {/* Feature Banner: Smart Trip Stylist & Wardrobe Insights */}
        <Card style={styles.featureBanner}>
          <TouchableOpacity
            onPress={() => router.push('/insights' as any)}
            style={styles.featureRow}
          >
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.accentLight },
              ]}
            >
              <Sparkles size={22} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                Wardrobe Insights & Gap Analysis
              </Text>
              <Text style={[styles.featureSub, { color: theme.textSecondary }]}>
                View real cost-per-wear stats, most worn staples, and missing clothing categories.
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.featureBanner}>
          <TouchableOpacity
            onPress={() => router.push('/trip' as any)}
            style={styles.featureRow}
          >
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.surfaceVariant },
              ]}
            >
              <CalendarIcon size={22} color={theme.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                Smart Trip Stylist
              </Text>
              <Text style={[styles.featureSub, { color: theme.textSecondary }]}>
                Generate a capsule packing checklist and multi-day outfit schedule for upcoming trips.
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Schedule Outfit Modal */}
      <Modal visible={isScheduleModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Schedule Outfit for {selectedDate}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Pick a look from your saved wardrobe combinations
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsScheduleModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
              >
                <X size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {savedLooks.map((look) => {
                const isSelected = selectedOutfitToSchedule?._id === look._id;
                return (
                  <TouchableOpacity
                    key={look._id || look.title}
                    onPress={() => setSelectedOutfitToSchedule(look)}
                    style={[
                      styles.lookOption,
                      {
                        backgroundColor: isSelected
                          ? theme.accentLight
                          : theme.surfaceVariant,
                        borderColor: isSelected ? theme.accent : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.lookOptionTitle, { color: theme.textPrimary }]}>
                        {look.title}
                      </Text>
                      <Text style={[styles.lookOptionOccasion, { color: theme.accent }]}>
                        {look.occasion} • {look.items.length} items
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={theme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="Confirm Schedule"
              variant="accent"
              size="lg"
              disabled={!selectedOutfitToSchedule}
              onPress={handleScheduleOutfit}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStripContainer: {
    marginVertical: SPACING.xs,
  },
  dateStrip: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  dayCard: {
    width: 54,
    height: 70,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  eventDot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laundryWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  laundryWarningText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  itemsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  itemCard: {
    flex: 1,
    padding: 6,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 64,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemRole: {
    fontSize: 9,
    marginTop: 1,
  },
  actionRow: {
    marginTop: SPACING.sm,
  },
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  confirmedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
  },
  featureBanner: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 11,
    lineHeight: 16,
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
    fontSize: 17,
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
  lookOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  lookOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  lookOptionOccasion: {
    fontSize: 12,
    marginTop: 2,
  },
});
