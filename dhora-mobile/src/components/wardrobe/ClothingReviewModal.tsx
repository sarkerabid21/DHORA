import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ClothingCategory,
  ClothingStatus,
  RecognizedAttributes,
} from '../../types/clothing';
import { SPACING, RADIUS } from '../../constants/theme';
import { ClothingItem } from '../../types/clothing';
import { VirtualMannequinModal } from './VirtualMannequinModal';

export interface ClothingReviewModalProps {
  visible: boolean;
  imageUri: string;
  initialAttributes: RecognizedAttributes | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES: ClothingCategory[] = [
  'TOPS',
  'BOTTOMS',
  'DRESSES',
  'OUTERWEAR',
  'FOOTWEAR',
  'ACCESSORIES',
  'TRADITIONAL',
];

const STATUS_OPTIONS: { label: string; value: ClothingStatus }[] = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'In Laundry', value: 'IN_LAUNDRY' },
  { label: 'Unavailable', value: 'UNAVAILABLE' },
];

export const ClothingReviewModal: React.FC<ClothingReviewModalProps> = ({
  visible,
  imageUri,
  initialAttributes,
  onClose,
  onSaved,
}) => {
  const { theme } = useThemeStore();
  const { addItem } = useWardrobeStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('TOPS');
  const [subcategory, setSubcategory] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [pattern, setPattern] = useState('');
  const [fabric, setFabric] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<ClothingStatus>('AVAILABLE');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showVirtualModel, setShowVirtualModel] = useState(false);

  const previewItem: ClothingItem = {
    _id: 'temp_preview_' + Date.now(),
    userId: 'current_user',
    name: name || 'Garment Preview',
    category,
    subcategory: subcategory.trim() || 'Garment',
    primaryColor: primaryColor.trim() || 'Neutral',
    secondaryColors: initialAttributes?.secondaryColors || [],
    pattern: pattern.trim() || 'Solid',
    fabric: fabric.trim() || 'Cotton',
    seasonality: initialAttributes?.seasonality || 'ALL_SEASON',
    brand: brand.trim() || undefined,
    size: size.trim() || undefined,
    purchasePrice: price ? parseFloat(price) : undefined,
    status,
    isFavorite: false,
    timesWorn: 0,
    imageUrl: imageUri,
    cleanedImageUrl: (initialAttributes as any)?.cleanedImageUrl || imageUri,
    notes: notes.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    if (initialAttributes) {
      setName(initialAttributes.name || '');
      setCategory(initialAttributes.category || 'TOPS');
      setSubcategory(initialAttributes.subcategory || 'Garment');
      setPrimaryColor(initialAttributes.primaryColor || 'Neutral');
      setPattern(initialAttributes.pattern || 'Solid');
      setFabric(initialAttributes.fabric || 'Cotton');
      setBrand(initialAttributes.brand || '');
    }
  }, [initialAttributes]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    await addItem({
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || 'Garment',
      primaryColor: primaryColor.trim() || 'Black',
      secondaryColors: initialAttributes?.secondaryColors || [],
      pattern: pattern.trim() || 'Solid',
      fabric: fabric.trim() || undefined,
      seasonality: initialAttributes?.seasonality || 'ALL_SEASON',
      brand: brand.trim() || undefined,
      size: size.trim() || undefined,
      purchasePrice: price ? parseFloat(price) : undefined,
      status,
      isFavorite: false,
      imageUrl: imageUri,
      notes: notes.trim() || undefined,
    });

    setIsSaving(false);
    onClose();
    onSaved();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={theme.accent} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Review & Save Item
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                AI detected these attributes. Feel free to tweak before adding.
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Image & Quick Badges */}
            <View style={styles.imageRow}>
              <Image source={{ uri: (initialAttributes as any)?.cleanedImageUrl || imageUri }} style={styles.previewThumb} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Badge label="AI Grounded" variant="accent" />
                  {(initialAttributes as any)?.cleanedImageUrl && (
                    <Badge label="Background Removed" variant="success" />
                  )}
                </View>
                <Text style={[styles.detectedHint, { color: theme.textSecondary }]}>
                  Detected Fabric: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{fabric || 'Cotton'}</Text>
                </Text>
                <Text style={[styles.detectedHint, { color: theme.textSecondary }]}>
                  Pattern: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{pattern || 'Solid'}</Text>
                </Text>

                {/* Try On Button */}
                <TouchableOpacity
                  onPress={() => setShowVirtualModel(true)}
                  style={[styles.tryOnBtn, { backgroundColor: theme.accent }]}
                >
                  <Sparkles size={13} color="#FFFFFF" />
                  <Text style={styles.tryOnBtnText}>👗 Try on AI Virtual Model</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Inputs */}
            <Input
              label="Item Name"
              placeholder="e.g. Slim Mandarin Collar Shirt"
              value={name}
              onChangeText={setName}
            />

            {/* Category Pills */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected
                          ? theme.textPrimary
                          : theme.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Color & Subcategory */}
            <View style={styles.twoColumnRow}>
              <Input
                label="Primary Color"
                value={primaryColor}
                onChangeText={setPrimaryColor}
                containerStyle={{ flex: 1 }}
              />
              <Input
                label="Subcategory"
                value={subcategory}
                onChangeText={setSubcategory}
                containerStyle={{ flex: 1 }}
              />
            </View>

            {/* Brand & Size */}
            <View style={styles.twoColumnRow}>
              <Input
                label="Brand (Optional)"
                placeholder="e.g. Aarong, Zara"
                value={brand}
                onChangeText={setBrand}
                containerStyle={{ flex: 1 }}
              />
              <Input
                label="Size (Optional)"
                placeholder="e.g. M, 32, 42"
                value={size}
                onChangeText={setSize}
                containerStyle={{ flex: 1 }}
              />
            </View>

            {/* Purchase Price & Status */}
            <Input
              label="Purchase Price in BDT (Optional)"
              placeholder="e.g. 2400"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Current Availability Status
            </Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isSelected
                          ? theme.accentLight
                          : theme.surfaceVariant,
                        borderColor: isSelected ? theme.accent : 'transparent',
                        borderWidth: isSelected ? 1.5 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isSelected
                            ? theme.accentDark
                            : theme.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <Input
              label="Notes (Optional)"
              placeholder="Care instructions, memories, or styling notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Save Button */}
            <Button
              title="Save to Wardrobe"
              variant="accent"
              size="lg"
              loading={isSaving}
              onPress={handleSave}
              icon={<Check size={18} color="#FFFFFF" />}
              style={{ marginTop: SPACING.md }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <VirtualMannequinModal
        visible={showVirtualModel}
        onClose={() => setShowVirtualModel(false)}
        focusItem={previewItem}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
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
  scrollBody: {
    paddingBottom: SPACING.xl,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  previewThumb: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
  },
  detectedHint: {
    fontSize: 12,
  },
  tryOnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  tryOnBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  catScroll: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 12,
  },
});
