import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Filter,
  Plus,
  Shirt,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useWardrobeStore } from '../../src/stores/wardrobeStore';
import { ClothingCard } from '../../src/components/wardrobe/ClothingCard';
import { ClothingUploadModal } from '../../src/components/wardrobe/ClothingUploadModal';
import { ClothingReviewModal } from '../../src/components/wardrobe/ClothingReviewModal';
import { VirtualMannequinModal } from '../../src/components/wardrobe/VirtualMannequinModal';
import { Card } from '../../src/components/common/Card';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Button } from '../../src/components/common/Button';
import { TopNavbar } from '../../src/components/common/TopNavbar';
import { RecognizedAttributes } from '../../src/types/clothing';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { useLocalSearchParams } from 'expo-router';

const CATEGORIES = [
  'All',
  'TOPS',
  'BOTTOMS',
  'TRADITIONAL',
  'FOOTWEAR',
  'OUTERWEAR',
  'DRESSES',
  'ACCESSORIES',
];

const STATUS_FILTERS = [
  { label: 'All Items', value: 'ALL' },
  { label: 'Ready to Wear', value: 'AVAILABLE' },
  { label: 'In Laundry', value: 'IN_LAUNDRY' },
];

export default function WardrobeScreen() {
  const params = useLocalSearchParams<{ action?: string }>();
  const { theme } = useThemeStore();
  const {
    items,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    fetchItems,
    isLoading,
  } = useWardrobeStore();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState('');
  const [recognizedAttributes, setRecognizedAttributes] =
    useState<RecognizedAttributes | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (params.action === 'upload') {
      setIsUploadModalOpen(true);
    }
  }, [params.action]);

  const handleRecognized = (
    attrs: RecognizedAttributes,
    imageUri: string
  ) => {
    setRecognizedAttributes(attrs);
    setCurrentImageUri(imageUri);
    setIsReviewModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.subcategory.toLowerCase().includes(query) ||
      item.primaryColor.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Universal DHORA Top Navigation Bar */}
      <TopNavbar subtitle="My Closet & Wardrobe" />

      {/* Closet Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            My Closet
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {items.length} garments digitized • {items.filter(i => i.status === 'AVAILABLE').length} ready to wear
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setIsStudioOpen(true)}
            style={[styles.studioBtn, { backgroundColor: theme.surfaceVariant, borderColor: theme.accent }]}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color={theme.accent} />
            <Text style={[styles.studioBtnText, { color: theme.accent }]}>AI Model</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsUploadModalOpen(true)}
            style={[styles.addFab, { backgroundColor: theme.accent }]}
            activeOpacity={0.8}
          >
            <Plus size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Search size={18} color={theme.textTertiary} />
          <TextInput
            placeholder="Search clothes by name, color, brand..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.statusFilterRow}>
        {STATUS_FILTERS.map((f) => {
          const isSelected = statusFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setStatusFilter(f.value)}
              style={[
                styles.statusFilterChip,
                {
                  backgroundColor: isSelected
                    ? theme.accentLight
                    : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  {
                    color: isSelected ? theme.accentDark : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Pills Strip */}
      <View style={styles.categoryStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStrip}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isSelected
                      ? theme.textPrimary
                      : theme.surface,
                    borderColor: isSelected ? theme.textPrimary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Closet Items Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
            <EmptyState
              icon={<Inbox size={32} color={theme.accent} />}
              title="Your Closet is Empty"
              description="Snap or upload photos of your real clothes. DHORA AI cleans the background and catalogs each garment to power your personalized AI looks."
              actionTitle="📸 Digitize Your Clothes"
              onAction={() => setIsUploadModalOpen(true)}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <ClothingCard key={item._id} item={item} />
            ))}
          </View>
        )}

        {/* AI Digitize Card Banner */}
        <Card style={styles.aiUploadBanner}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsUploadModalOpen(true)}
            style={styles.aiBannerRow}
          >
            <View
              style={[
                styles.aiBannerIcon,
                { backgroundColor: theme.accentLight },
              ]}
            >
              <Sparkles size={24} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiBannerTitle, { color: theme.textPrimary }]}>
                Digitize Clothes with AI
              </Text>
              <Text style={[styles.aiBannerSubtitle, { color: theme.textSecondary }]}>
                DHORA automatically cleans the background, detects categories, colors, patterns, and fabric in seconds.
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Upload and AI Recognition Modal */}
      <ClothingUploadModal
        visible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onRecognized={handleRecognized}
      />

      {/* Post-AI Review and Edit Modal */}
      <ClothingReviewModal
        visible={isReviewModalOpen}
        imageUri={currentImageUri}
        initialAttributes={recognizedAttributes}
        onClose={() => setIsReviewModalOpen(false)}
        onSaved={() => {}}
      />

      {/* AI Virtual Model / Mannequin Studio */}
      <VirtualMannequinModal
        visible={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
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
  studioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  studioBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
  },
  statusFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginTop: 6,
    marginBottom: 4,
  },
  statusFilterChip: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusFilterText: {
    fontSize: 11,
  },
  categoryStripContainer: {
    marginVertical: 6,
  },
  categoryStrip: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  catPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiUploadBanner: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  aiBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiBannerSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
});
