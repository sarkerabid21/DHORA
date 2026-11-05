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
  Heart,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  Tag,
  DollarSign,
  Shirt,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useWardrobeStore } from '../../src/stores/wardrobeStore';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { ClothingStatus } from '../../src/types/clothing';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { VirtualMannequinModal } from '../../src/components/wardrobe/VirtualMannequinModal';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const { items, toggleFavorite, updateStatus, deleteItem } = useWardrobeStore();
  const [showVirtualModel, setShowVirtualModel] = useState(false);

  const item = items.find((i) => i._id === id);

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.textPrimary }]}>
            Clothing item not found.
          </Text>
          <Button
            title="Back to Closet"
            variant="accent"
            size="md"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const costPerWear = item.purchasePrice
    ? Math.round(item.purchasePrice / Math.max(item.timesWorn, 1))
    : null;

  const handleStatusChange = (newStatus: ClothingStatus) => {
    updateStatus(item._id, newStatus);
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove from Closet',
      `Are you sure you want to remove "${item.name}" from your wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item._id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Floating Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.circleBtn, { backgroundColor: theme.surface }]}
        >
          <ChevronLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item._id)}
            style={[styles.circleBtn, { backgroundColor: theme.surface }]}
          >
            <Heart
              size={20}
              color={item.isFavorite ? '#EF4444' : theme.textPrimary}
              fill={item.isFavorite ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.circleBtn, { backgroundColor: theme.surface }]}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Full Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.badgeOverlay}>
            <Badge
              label={
                item.status === 'IN_LAUNDRY'
                  ? 'In Laundry'
                  : item.status === 'UNAVAILABLE'
                  ? 'Unavailable'
                  : 'Ready to Wear'
              }
              variant={
                item.status === 'IN_LAUNDRY'
                  ? 'warning'
                  : item.status === 'UNAVAILABLE'
                  ? 'error'
                  : 'success'
              }
            />
          </View>
        </View>

        {/* Content Container */}
        <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
          {/* Title & Brand */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {item.name}
          </Text>

          <Text style={[styles.brand, { color: theme.accent }]}>
            {item.brand || 'Personal Collection'} • {item.subcategory}
          </Text>

          {/* AI Virtual Model Try-On Banner */}
          <TouchableOpacity
            onPress={() => setShowVirtualModel(true)}
            style={[styles.virtualModelHeroBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.accent }]}
          >
            <View style={[styles.vmIconBadge, { backgroundColor: theme.accent }]}>
              <Sparkles size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.virtualModelHeroText, { color: theme.textPrimary }]}>
                👗 Try on AI Virtual Model
              </Text>
              <Text style={[styles.virtualModelHeroSub, { color: theme.textSecondary }]}>
                Fit onto mannequin • Layer with closet & test drape
              </Text>
            </View>
          </TouchableOpacity>

          {/* Availability Status Switcher */}
          <View style={styles.statusSection}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              Availability Status
            </Text>
            <View style={styles.statusButtons}>
              <TouchableOpacity
                onPress={() => handleStatusChange('AVAILABLE')}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      item.status === 'AVAILABLE'
                        ? '#ECFDF5'
                        : theme.surfaceVariant,
                    borderColor:
                      item.status === 'AVAILABLE' ? '#10B981' : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <CheckCircle2
                  size={15}
                  color={item.status === 'AVAILABLE' ? '#059669' : theme.textTertiary}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    {
                      color:
                        item.status === 'AVAILABLE'
                          ? '#059669'
                          : theme.textSecondary,
                    },
                  ]}
                >
                  Available
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusChange('IN_LAUNDRY')}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      item.status === 'IN_LAUNDRY'
                        ? '#FFFBEB'
                        : theme.surfaceVariant,
                    borderColor:
                      item.status === 'IN_LAUNDRY' ? '#F59E0B' : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Clock
                  size={15}
                  color={item.status === 'IN_LAUNDRY' ? '#D97706' : theme.textTertiary}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    {
                      color:
                        item.status === 'IN_LAUNDRY'
                          ? '#D97706'
                          : theme.textSecondary,
                    },
                  ]}
                >
                  In Laundry
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusChange('UNAVAILABLE')}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      item.status === 'UNAVAILABLE'
                        ? '#FEF2F2'
                        : theme.surfaceVariant,
                    borderColor:
                      item.status === 'UNAVAILABLE' ? '#EF4444' : 'transparent',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <AlertCircle
                  size={15}
                  color={item.status === 'UNAVAILABLE' ? '#DC2626' : theme.textTertiary}
                />
                <Text
                  style={[
                    styles.statusBtnText,
                    {
                      color:
                        item.status === 'UNAVAILABLE'
                          ? '#DC2626'
                          : theme.textSecondary,
                    },
                  ]}
                >
                  Unavailable
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Garment Attributes Grid */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            Item Specifications
          </Text>

          <View style={styles.specsGrid}>
            <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Category</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.category}</Text>
            </View>

            <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Primary Color</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.primaryColor}</Text>
            </View>

            <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Pattern</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.pattern || 'Solid'}</Text>
            </View>

            <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Fabric</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.fabric || 'Cotton'}</Text>
            </View>

            {item.size ? (
              <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
                <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Size</Text>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.size}</Text>
              </View>
            ) : null}

            <View style={[styles.specItem, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Season</Text>
              <Text style={[styles.specValue, { color: theme.textPrimary }]}>{item.seasonality}</Text>
            </View>
          </View>

          {/* Wardrobe Intelligence & Metrics */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            Wardrobe Insights & Usage
          </Text>

          <View style={styles.metricsRow}>
            <Card style={styles.metricCard}>
              <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
                {item.timesWorn}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Times Worn
              </Text>
            </Card>

            {costPerWear ? (
              <Card style={styles.metricCard}>
                <Text style={[styles.metricNumber, { color: theme.accent }]}>
                  ৳{costPerWear}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Cost Per Wear
                </Text>
              </Card>
            ) : null}

            {item.purchasePrice ? (
              <Card style={styles.metricCard}>
                <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
                  ৳{item.purchasePrice}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Original Price
                </Text>
              </Card>
            ) : null}
          </View>

          {/* Notes */}
          {item.notes ? (
            <View style={[styles.notesContainer, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={[styles.notesLabel, { color: theme.textPrimary }]}>
                Styling & Care Notes
              </Text>
              <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                {item.notes}
              </Text>
            </View>
          ) : null}

          {/* Action to ask AI Stylist to style this specific item */}
          <Button
            title={`Ask AI to Style This ${item.subcategory}`}
            variant="accent"
            size="lg"
            onPress={() => router.push('/(tabs)/stylist')}
            icon={<Sparkles size={18} color="#FFFFFF" />}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </ScrollView>

      <VirtualMannequinModal
        visible={showVirtualModel}
        onClose={() => setShowVirtualModel(false)}
        focusItem={item}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  navBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  navActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 380,
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  virtualModelHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  vmIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  virtualModelHeroText: {
    fontSize: 14,
    fontWeight: '700',
  },
  virtualModelHeroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statusSection: {
    marginBottom: SPACING.md,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  specItem: {
    width: '48.5%',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  notesContainer: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
