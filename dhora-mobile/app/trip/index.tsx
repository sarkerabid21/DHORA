import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plane,
  Calendar,
  Sparkles,
  Check,
  CheckCircle2,
  Luggage,
  MapPin,
  AlertCircle,
  ThermometerSnowflake,
  ShoppingBag,
  Repeat,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useTripStore } from '../../src/stores/tripStore';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { SPACING, RADIUS } from '../../src/constants/theme';

const DESTINATIONS = [
  'Sajek Valley & Hills',
  "Cox's Bazar Beach",
  'Sylhet Tea Gardens',
  'Bandarban Nilgiri',
  'Darjeeling & Mountains',
  'Sreemangal Mist',
];

const ACTIVITIES = [
  'Sightseeing & Walking',
  'Beach & Sunset',
  'Fine Dining',
  'Cafe Hangout',
  'Outdoor Trekking & Hills',
];

export default function TripStylistScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useThemeStore();
  const { currentPlan, generateTripPlan, isLoading } = useTripStore();

  const [destination, setDestination] = useState('Sajek Valley & Hills');
  const [durationDays, setDurationDays] = useState(3);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'Sightseeing & Walking',
    'Outdoor Trekking & Hills',
  ]);

  const toggleActivity = (act: string) => {
    if (selectedActivities.includes(act)) {
      if (selectedActivities.length > 1) {
        setSelectedActivities(selectedActivities.filter((a) => a !== act));
      }
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please enter where you are traveling.');
      return;
    }

    try {
      await generateTripPlan({
        destination: destination.trim(),
        durationDays,
        activities: selectedActivities,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not generate trip plan.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Smart Trip Stylist
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Capsule wardrobe packing list & weather-smart outfits
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Destination & Duration Form */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            1. Where are you traveling? (কোথায় ট্যুর দেবেন?)
          </Text>

          {/* Typeable Destination Input */}
          <View style={styles.locationInputRow}>
            <View style={[styles.locationIconBox, { backgroundColor: theme.surfaceVariant }]}>
              <MapPin size={18} color={theme.accent} />
            </View>
            <TextInput
              style={[
                styles.locationInput,
                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="Type any destination (e.g. Sajek, Darjeeling, Cox's Bazar...)"
              placeholderTextColor={theme.textSecondary}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <Text style={[styles.subLabel, { color: theme.textSecondary }]}>
            Popular Destinations (tap to autofill):
          </Text>
          <View style={styles.chipsRow}>
            {DESTINATIONS.map((dest) => {
              const isSelected = destination === dest;
              return (
                <TouchableOpacity
                  key={dest}
                  onPress={() => setDestination(dest)}
                  style={[
                    styles.destChip,
                    {
                      backgroundColor: isSelected
                        ? theme.accentLight
                        : theme.surfaceVariant,
                      borderColor: isSelected ? theme.accent : 'transparent',
                      borderWidth: isSelected ? 1.5 : 0,
                    },
                  ]}
                >
                  <MapPin size={12} color={isSelected ? theme.accent : theme.textSecondary} />
                  <Text
                    style={[
                      styles.destChipText,
                      { color: isSelected ? theme.accentDark : theme.textPrimary },
                    ]}
                  >
                    {dest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Trip Duration with Stepper + Chips */}
          <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: SPACING.md }]}>
            2. Trip Duration (কতদিনের ট্যুর?)
          </Text>

          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setDurationDays(Math.max(1, durationDays - 1))}
              style={[styles.stepBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <Minus size={18} color={theme.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.stepCountBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Luggage size={16} color={theme.accent} />
              <Text style={[styles.stepCountText, { color: theme.textPrimary }]}>
                {durationDays} Days Backpack
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setDurationDays(Math.min(14, durationDays + 1))}
              style={[styles.stepBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <Plus size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.durationChipsRow}>
            {[2, 3, 4, 5, 7, 10].map((days) => {
              const isSelected = durationDays === days;
              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => setDurationDays(days)}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: isSelected
                        ? theme.textPrimary
                        : theme.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {days} Days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Activities */}
          <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: SPACING.md }]}>
            3. Planned Activities
          </Text>

          <View style={styles.chipsRow}>
            {ACTIVITIES.map((act) => {
              const isSelected = selectedActivities.includes(act);
              return (
                <TouchableOpacity
                  key={act}
                  onPress={() => toggleActivity(act)}
                  style={[
                    styles.activityChip,
                    {
                      backgroundColor: isSelected
                        ? theme.accent
                        : theme.surfaceVariant,
                    },
                  ]}
                >
                  {isSelected && <Check size={13} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.activityText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {act}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={isLoading ? 'Calculating Weather & Capsule...' : 'Plan Tour Backpack ✨'}
            variant="accent"
            size="lg"
            loading={isLoading}
            onPress={handleGenerate}
            icon={<Sparkles size={18} color="#FFFFFF" />}
            style={{ marginTop: SPACING.lg }}
          />
        </Card>

        {/* Results Section */}
        {currentPlan && (
          <View style={{ marginTop: SPACING.lg }}>
            {/* Climate & Forecast Banner */}
            <Card style={styles.resultBanner}>
              <View style={styles.resultHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Plane size={18} color={theme.accent} />
                  <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>
                    {currentPlan.destination} ({currentPlan.durationDays} Days)
                  </Text>
                </View>
                {currentPlan.weatherTemperature !== undefined && (
                  <Badge
                    label={`${currentPlan.weatherTemperature}°C • ${currentPlan.weatherCondition || 'Climate'}`}
                    variant="accent"
                  />
                )}
              </View>

              <Text style={[styles.resultForecast, { color: theme.textSecondary }]}>
                {currentPlan.forecastSummary}
              </Text>

              <View style={[styles.reusableBox, { backgroundColor: theme.surfaceVariant }]}>
                <Text style={[styles.reusableText, { color: theme.accent }]}>
                  💡 Capsule Synergy: {currentPlan.reusableItemsNotes}
                </Text>
              </View>
            </Card>

            {/* CRITICAL MISSING WEATHER ESSENTIALS ALERT CARD */}
            {currentPlan.hasMissingWeatherItems && (
              <Card
                style={[
                  styles.missingWeatherCard,
                  {
                    backgroundColor: isDarkMode ? '#451A03' : '#FFFBEB',
                    borderColor: '#F59E0B',
                  },
                ]}
              >
                <View style={styles.missingWeatherHeader}>
                  <View style={styles.alertIconBadge}>
                    <ThermometerSnowflake size={22} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.missingWeatherTitle, { color: '#B45309' }]}>
                      ⚠️ Missing Weather Essentials (Wardrobe-এ নেই!)
                    </Text>
                    <Text style={[styles.missingWeatherSub, { color: theme.textSecondary }]}>
                      Destination climate requires clothing you haven't digitized in your wardrobe yet.
                    </Text>
                  </View>
                </View>

                {currentPlan.missingItemsAdvice && (
                  <View style={styles.adviceBubble}>
                    <Text style={[styles.missingAdviceText, { color: theme.textPrimary }]}>
                      {currentPlan.missingItemsAdvice}
                    </Text>
                  </View>
                )}

                {currentPlan.missingItemsList && currentPlan.missingItemsList.length > 0 && (
                  <View style={styles.missingPillsRow}>
                    {currentPlan.missingItemsList.map((item, idx) => (
                      <View key={idx} style={styles.missingPill}>
                        <Text style={styles.missingPillText}>+ {item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.missingActionsRow}>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/discover?tab=rent')}
                    style={[styles.missingActionBtn, { backgroundColor: theme.accent }]}
                  >
                    <Repeat size={14} color="#FFFFFF" />
                    <Text style={styles.missingActionBtnText}>Browse DHORA Rent (ভাড়া নিন)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/discover?tab=shop')}
                    style={[styles.missingActionBtn, { backgroundColor: theme.surfaceVariant }]}
                  >
                    <ShoppingBag size={14} color={theme.textPrimary} />
                    <Text style={[styles.missingActionBtnText, { color: theme.textPrimary }]}>
                      Fashion Shopping
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            {/* Packing Checklist */}
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Luggage size={18} color={theme.accent} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Capsule Packing Checklist ({currentPlan.packedList.length} Items from Wardrobe)
                </Text>
              </View>
            </View>

            <View style={styles.packingGrid}>
              {currentPlan.packedList.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.packingCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.packingImage} />
                  <Text numberOfLines={1} style={[styles.packingName, { color: theme.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.packingRole, { color: theme.textSecondary }]}>
                    {item.category} • {item.color}
                  </Text>
                </View>
              ))}
            </View>

            {/* Daily Outfit Schedule */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Daily Outfit Rotation
              </Text>
            </View>

            {currentPlan.plannedOutfits.map((outfit) => (
              <Card key={outfit.dayNumber} style={styles.dailyOutfitCard}>
                <Text style={[styles.dayLabel, { color: theme.accent }]}>
                  Day {outfit.dayNumber} • {outfit.activity}
                </Text>
                <Text style={[styles.dayOutfitTitle, { color: theme.textPrimary }]}>
                  {outfit.outfitTitle}
                </Text>

                <View style={styles.dailyItemsRow}>
                  {outfit.items.map((it, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dailyMiniCard,
                        { backgroundColor: theme.surfaceVariant },
                      ]}
                    >
                      <Image source={{ uri: it.imageUrl }} style={styles.dailyMiniImage} />
                      <Text numberOfLines={1} style={[styles.dailyMiniText, { color: theme.textPrimary }]}>
                        {it.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },
  formCard: {
    padding: SPACING.md,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  destChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  destChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCountBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  durationChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultBanner: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultForecast: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  reusableBox: {
    padding: 10,
    borderRadius: 8,
  },
  reusableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  missingWeatherCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  missingWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  alertIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingWeatherTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  missingWeatherSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  adviceBubble: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  missingAdviceText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  missingPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  missingPill: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  missingActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  missingActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  missingActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  packingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  packingCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  packingImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    marginBottom: 6,
  },
  packingName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  packingRole: {
    fontSize: 10,
    marginTop: 2,
  },
  dailyOutfitCard: {
    padding: 12,
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  dayOutfitTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  dailyItemsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dailyMiniCard: {
    flex: 1,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  dailyMiniImage: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    marginBottom: 4,
  },
  dailyMiniText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
