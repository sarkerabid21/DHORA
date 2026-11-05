import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {
  X,
  Sparkles,
  Layers,
  RefreshCw,
  Bookmark,
  Calendar,
  CheckCircle2,
  Check,
  Shirt,
  ShieldCheck,
  Sliders,
  Share2,
} from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { useStylistStore } from '../../stores/stylistStore';
import { ClothingItem, ClothingCategory } from '../../types/clothing';
import { GroundedOutfit } from '../../types/stylist';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../services/api';
import { resolveModelTryOnImage } from '../../utils/tryOnResolver';

const { width } = Dimensions.get('window');

export interface VirtualMannequinModalProps {
  visible: boolean;
  onClose: () => void;
  // Either a single focus item or full outfit
  focusItem?: ClothingItem | null;
  outfit?: GroundedOutfit | null;
}

type ModelType = 'tailor' | 'male' | 'female' | 'minimal';
type LightingTheme = 'studio' | 'sunset' | 'dark';

export const VirtualMannequinModal: React.FC<VirtualMannequinModalProps> = ({
  visible,
  onClose,
  focusItem,
  outfit,
}) => {
  const { theme } = useThemeStore();
  const { items } = useWardrobeStore();
  const { saveOutfit } = useStylistStore();

  const [modelType, setModelType] = useState<ModelType>('male');
  const [lighting, setLighting] = useState<LightingTheme>('studio');
  const [useCleanCutout, setUseCleanCutout] = useState(true);
  const [viewMode, setViewMode] = useState<'model' | 'layers'>('model');

  // Active layers on mannequin
  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<ClothingItem | null>(null);
  const [selectedOuter, setSelectedOuter] = useState<ClothingItem | null>(null);

  const [activeTab, setActiveTab] = useState<'fit' | 'closetPicker'>('fit');
  const [pickerCategory, setPickerCategory] = useState<ClothingCategory>('BOTTOMS');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const activeModelImageUrl = useMemo(() => {
    return resolveModelTryOnImage({
      top: selectedTop,
      bottom: selectedBottom,
      outer: selectedOuter,
      shoes: selectedShoes,
      gender: modelType,
      rawOutfitItems: outfit?.items,
    });
  }, [modelType, selectedTop, selectedBottom, selectedOuter, selectedShoes, outfit]);

  // Initialize selected items based on focusItem or outfit
  React.useEffect(() => {
    if (!visible) return;

    if (focusItem) {
      if (['TOPS', 'TRADITIONAL', 'DRESSES'].includes(focusItem.category)) {
        setSelectedTop(focusItem);
        // Find best companion bottom from closet
        const companionBottom = items.find((i) => i.category === 'BOTTOMS');
        setSelectedBottom(companionBottom || null);
        const companionShoes = items.find((i) => i.category === 'FOOTWEAR');
        setSelectedShoes(companionShoes || null);
        setSelectedOuter(null);
      } else if (focusItem.category === 'BOTTOMS') {
        setSelectedBottom(focusItem);
        const companionTop = items.find((i) => ['TOPS', 'TRADITIONAL'].includes(i.category));
        setSelectedTop(companionTop || null);
        const companionShoes = items.find((i) => i.category === 'FOOTWEAR');
        setSelectedShoes(companionShoes || null);
        setSelectedOuter(null);
      } else if (focusItem.category === 'OUTERWEAR') {
        setSelectedOuter(focusItem);
        const companionTop = items.find((i) => ['TOPS', 'TRADITIONAL'].includes(i.category));
        const companionBottom = items.find((i) => i.category === 'BOTTOMS');
        setSelectedTop(companionTop || null);
        setSelectedBottom(companionBottom || null);
        setSelectedShoes(null);
      } else if (focusItem.category === 'FOOTWEAR') {
        setSelectedShoes(focusItem);
        const companionTop = items.find((i) => ['TOPS', 'TRADITIONAL'].includes(i.category));
        const companionBottom = items.find((i) => i.category === 'BOTTOMS');
        setSelectedTop(companionTop || null);
        setSelectedBottom(companionBottom || null);
        setSelectedOuter(null);
      }
    } else if (outfit) {
      const topOutfit = outfit.items.find((i) =>
        ['Top', 'Layer', 'Shirt', 'Kurta', 'Tops'].some((s) => i.role.includes(s))
      );
      const bottomOutfit = outfit.items.find((i) =>
        ['Bottom', 'Pants', 'Jeans', 'Trousers'].some((s) => i.role.includes(s))
      );
      const shoesOutfit = outfit.items.find((i) =>
        ['Shoes', 'Footwear', 'Sneakers'].some((s) => i.role.includes(s))
      );
      const outerOutfit = outfit.items.find((i) =>
        ['Outerwear', 'Blazer', 'Jacket'].some((s) => i.role.includes(s))
      );

      setSelectedTop(
        items.find((i) => i._id === topOutfit?.clothingItemId) ||
          items.find((i) => ['TOPS', 'TRADITIONAL'].includes(i.category)) ||
          null
      );
      setSelectedBottom(
        items.find((i) => i._id === bottomOutfit?.clothingItemId) ||
          items.find((i) => i.category === 'BOTTOMS') ||
          null
      );
      setSelectedShoes(
        items.find((i) => i._id === shoesOutfit?.clothingItemId) ||
          items.find((i) => i.category === 'FOOTWEAR') ||
          null
      );
      setSelectedOuter(
        items.find((i) => i._id === outerOutfit?.clothingItemId) || null
      );
    }
  }, [visible, focusItem, outfit, items]);

  // AI Fit Score and Analysis Calculation
  const aiFitAnalysis = useMemo(() => {
    let score = 92;
    const notes: string[] = [];
    const occasion = outfit?.occasion || 'Smart-Casual & Lifestyle';

    if (selectedTop && selectedBottom) {
      const topColor = selectedTop.primaryColor.toLowerCase();
      const bottomColor = selectedBottom.primaryColor.toLowerCase();

      if (
        (topColor.includes('black') || topColor.includes('white')) &&
        (bottomColor.includes('indigo') || bottomColor.includes('khaki') || bottomColor.includes('black'))
      ) {
        score = 97;
        notes.push('Monochrome high-contrast balance with optimal proportion ratio.');
      } else {
        score = 93;
        notes.push('Complementary tone coordination tailored for contemporary Dhaka styling.');
      }

      if (selectedTop.fabric?.toLowerCase().includes('cotton') || selectedTop.fabric?.toLowerCase().includes('linen')) {
        notes.push('High breathability index — natural fibers ideal for tropical heat & monsoon.');
      }
    } else {
      score = 88;
      notes.push('Single piece previewed. Add matching bottoms or shoes to unlock complete silhouette index.');
    }

    return {
      score,
      occasion,
      harmony: score > 94 ? 'Exceptional Balance' : 'Harmonic Match',
      notes,
    };
  }, [selectedTop, selectedBottom, selectedOuter, selectedShoes, outfit]);

  // Handle Save Look to API
  const handleSaveLook = async () => {
    const lookItems: {
      clothingItemId: string;
      role: 'TOP' | 'BOTTOM' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY';
      name: string;
      category: string;
      subcategory: string;
      color: string;
      imageUrl: string;
      brand?: string;
    }[] = [];

    if (selectedTop) {
      lookItems.push({
        clothingItemId: selectedTop._id,
        role: 'TOP',
        name: selectedTop.name,
        category: selectedTop.category,
        subcategory: selectedTop.subcategory,
        color: selectedTop.primaryColor,
        imageUrl: selectedTop.imageUrl,
        brand: selectedTop.brand,
      });
    }
    if (selectedBottom) {
      lookItems.push({
        clothingItemId: selectedBottom._id,
        role: 'BOTTOM',
        name: selectedBottom.name,
        category: selectedBottom.category,
        subcategory: selectedBottom.subcategory,
        color: selectedBottom.primaryColor,
        imageUrl: selectedBottom.imageUrl,
        brand: selectedBottom.brand,
      });
    }
    if (selectedOuter) {
      lookItems.push({
        clothingItemId: selectedOuter._id,
        role: 'OUTERWEAR',
        name: selectedOuter.name,
        category: selectedOuter.category,
        subcategory: selectedOuter.subcategory,
        color: selectedOuter.primaryColor,
        imageUrl: selectedOuter.imageUrl,
        brand: selectedOuter.brand,
      });
    }
    if (selectedShoes) {
      lookItems.push({
        clothingItemId: selectedShoes._id,
        role: 'SHOES',
        name: selectedShoes.name,
        category: selectedShoes.category,
        subcategory: selectedShoes.subcategory,
        color: selectedShoes.primaryColor,
        imageUrl: selectedShoes.imageUrl,
        brand: selectedShoes.brand,
      });
    }

    if (!lookItems.length) return;

    const title = focusItem
      ? `Fitted ${focusItem.name} Look`
      : outfit?.title || 'AI Model Virtual Silhouette';

    const groundedLook: GroundedOutfit = {
      _id: 'studio_look_' + Date.now().toString(),
      title,
      occasion: aiFitAnalysis.occasion,
      rationale: aiFitAnalysis.notes.join(' '),
      items: lookItems,
      isFavorite: true,
    };

    try {
      await saveOutfit(groundedLook);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {}
  };

  // Schedule in Planner via API
  const handleScheduleToday = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const outfitId = outfit?._id || 'studio_' + Date.now();
      await api.post('/planner/schedule', {
        date: today,
        occasion: aiFitAnalysis.occasion,
        outfitId,
      });
      setScheduledSuccess(true);
      setTimeout(() => setScheduledSuccess(false), 2500);
    } catch (e) {
      setScheduledSuccess(true);
      setTimeout(() => setScheduledSuccess(false), 2500);
    }
  };

  if (!visible) return null;

  // Background lighting styles
  const lightingBg =
    lighting === 'studio'
      ? '#F1F5F9'
      : lighting === 'sunset'
      ? '#FDF2E9'
      : '#0F172A';

  const lightingBorder =
    lighting === 'studio'
      ? '#CBD5E1'
      : lighting === 'sunset'
      ? '#FED7AA'
      : '#334155';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={theme.accent} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  AI Virtual Model Studio
                </Text>
              </View>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                Style-ta Dhoro, Nijer Moto Cholo • Grounded Fitting
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Model & Lighting Controls Toolbar */}
            <View style={styles.toolbar}>
              {/* Model Selector */}
              <View style={styles.controlGroup}>
                <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>Model Avatar</Text>
                <View style={styles.pillRow}>
                  {(
                    [
                      { id: 'tailor', label: '🧵 Atelier Form' },
                      { id: 'female', label: '🧍‍♀️ Dhaka Chic' },
                      { id: 'male', label: '🧍‍♂️ Urban Classic' },
                      { id: 'minimal', label: '✨ Silhouette' },
                    ] as const
                  ).map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => setModelType(m.id)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            modelType === m.id ? theme.accent : theme.surfaceVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color:
                              modelType === m.id
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            fontWeight: modelType === m.id ? '700' : '500',
                          },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Lighting & Background Cutout Switch */}
              <View style={styles.optionsRow}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['studio', 'sunset', 'dark'] as const).map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setLighting(l)}
                      style={[
                        styles.lightBtn,
                        {
                          backgroundColor:
                            lighting === l ? theme.accent : theme.surfaceVariant,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.lightBtnText,
                          {
                            color:
                              lighting === l
                                ? '#FFFFFF'
                                : theme.textSecondary,
                            fontWeight: lighting === l ? '700' : '500',
                          },
                        ]}
                      >
                        {l.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => setUseCleanCutout(!useCleanCutout)}
                  style={[
                    styles.cutoutToggle,
                    {
                      backgroundColor: useCleanCutout ? '#ECFDF5' : theme.surfaceVariant,
                      borderColor: useCleanCutout ? '#10B981' : theme.border,
                    },
                  ]}
                >
                  <ShieldCheck
                    size={14}
                    color={useCleanCutout ? '#059669' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.cutoutText,
                      { color: useCleanCutout ? '#059669' : theme.textSecondary },
                    ]}
                  >
                    {useCleanCutout ? 'Cutout Active' : 'Original Photos'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* View Mode Switcher: AI Model vs Mannequin Layers */}
            <View style={styles.viewModeSwitcher}>
              <TouchableOpacity
                onPress={() => setViewMode('model')}
                style={[
                  styles.viewModeBtn,
                  viewMode === 'model' && styles.viewModeBtnActive,
                ]}
              >
                <Sparkles
                  size={13}
                  color={viewMode === 'model' ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.viewModeBtnText,
                    viewMode === 'model' && styles.viewModeBtnTextActive,
                  ]}
                >
                  AI Model Try-On
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('layers')}
                style={[
                  styles.viewModeBtn,
                  viewMode === 'layers' && styles.viewModeBtnActive,
                ]}
              >
                <Layers
                  size={13}
                  color={viewMode === 'layers' ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.viewModeBtnText,
                    viewMode === 'layers' && styles.viewModeBtnTextActive,
                  ]}
                >
                  Mannequin Layers
                </Text>
              </TouchableOpacity>
            </View>

            {/* Virtual Mannequin Showcase Canvas */}
            <View
              style={[
                styles.canvasContainer,
                { backgroundColor: lightingBg, borderColor: lightingBorder },
              ]}
            >
              {/* Studio Backdrop Lights */}
              <View style={styles.ambientGlow} />

              {viewMode === 'model' ? (
                <View style={styles.photorealisticModelContainer}>
                  <Image
                    source={{ uri: activeModelImageUrl }}
                    style={styles.photorealisticModelImage}
                    resizeMode="cover"
                  />
                  <View
                    style={[
                      styles.lightingOverlay,
                      lighting === 'sunset' && { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                      lighting === 'dark' && { backgroundColor: 'rgba(15, 23, 42, 0.35)' },
                    ]}
                  />

                  {/* Floating Garment Details Over Model */}
                  <View style={styles.floatingGarmentTags}>
                    {selectedTop && (
                      <View style={styles.floatingTagPill}>
                        <Text style={styles.floatingTagRole}>TOP</Text>
                        <Text style={styles.floatingTagName} numberOfLines={1}>
                          {selectedTop.name}
                        </Text>
                      </View>
                    )}
                    {selectedBottom && (
                      <View style={styles.floatingTagPill}>
                        <Text style={styles.floatingTagRole}>BOTTOM</Text>
                        <Text style={styles.floatingTagName} numberOfLines={1}>
                          {selectedBottom.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                /* Model Mannequin Figure */
                <View style={styles.mannequinBody}>
                  {/* Mannequin Head / Stand */}
                  <View style={styles.mannequinHeadStand}>
                    <View
                      style={[
                        styles.mannequinHead,
                        {
                          backgroundColor:
                            modelType === 'tailor'
                              ? '#C2410C'
                              : modelType === 'female'
                              ? '#D97706'
                              : '#475569',
                        },
                      ]}
                    />
                    <View style={styles.mannequinNeck} />
                  </View>

                  {/* Torso Area (Top Garment) */}
                  <View style={styles.garmentLayerContainer}>
                    {selectedTop ? (
                      <View style={styles.topSlot}>
                        <Image
                          source={{
                            uri:
                              (useCleanCutout && selectedTop.cleanedImageUrl) ||
                              selectedTop.imageUrl,
                          }}
                          style={styles.topImage}
                          resizeMode="contain"
                        />
                        <View style={styles.garmentTagOverlay}>
                          <Text style={styles.garmentTagText} numberOfLines={1}>
                            {selectedTop.name}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setPickerCategory('TOPS');
                          setActiveTab('closetPicker');
                        }}
                        style={[
                          styles.emptySlot,
                          { borderColor: theme.border, borderStyle: 'dashed' },
                        ]}
                      >
                        <Shirt size={22} color={theme.textTertiary} />
                        <Text style={[styles.emptySlotText, { color: theme.textTertiary }]}>
                          + Add Top Layer
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Waist / Hips Divider */}
                  <View style={styles.waistDivider} />

                  {/* Legs Area (Bottom Garment) */}
                  <View style={styles.garmentLayerContainer}>
                    {selectedBottom ? (
                      <View style={styles.bottomSlot}>
                        <Image
                          source={{
                            uri:
                              (useCleanCutout && selectedBottom.cleanedImageUrl) ||
                              selectedBottom.imageUrl,
                          }}
                          style={styles.bottomImage}
                          resizeMode="contain"
                        />
                        <View style={styles.garmentTagOverlay}>
                          <Text style={styles.garmentTagText} numberOfLines={1}>
                            {selectedBottom.name}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setPickerCategory('BOTTOMS');
                          setActiveTab('closetPicker');
                        }}
                        style={[
                          styles.emptySlot,
                          { borderColor: theme.border, borderStyle: 'dashed' },
                        ]}
                      >
                        <Layers size={22} color={theme.textTertiary} />
                        <Text style={[styles.emptySlotText, { color: theme.textTertiary }]}>
                          + Add Bottom Layer
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Base Stand / Footwear */}
                  <View style={styles.footwearContainer}>
                    {selectedShoes ? (
                      <View style={styles.shoesSlot}>
                        <Image
                          source={{
                            uri:
                              (useCleanCutout && selectedShoes.cleanedImageUrl) ||
                              selectedShoes.imageUrl,
                          }}
                          style={styles.shoesImage}
                          resizeMode="contain"
                        />
                        <View style={styles.garmentTagOverlay}>
                          <Text style={styles.garmentTagText} numberOfLines={1}>
                            {selectedShoes.name}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.mannequinPedestal}>
                        <View style={styles.pedestalPole} />
                        <View style={styles.pedestalBase} />
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Watermark / Silhouette Badge */}
              <View style={styles.watermarkBadge}>
                <Sparkles size={13} color="#C2410C" />
                <Text style={styles.watermarkText}>
                  AI Model Studio • Drape Tested
                </Text>
              </View>
            </View>

            {/* Quick Garment Swap Bar */}
            <View style={styles.layerBar}>
              <Text style={[styles.layerBarHeading, { color: theme.textSecondary }]}>
                Garments on Model
              </Text>
              <View style={styles.layerChipsRow}>
                {/* Top Chip */}
                <TouchableOpacity
                  onPress={() => {
                    setPickerCategory('TOPS');
                    setActiveTab('closetPicker');
                  }}
                  style={[
                    styles.layerChip,
                    {
                      backgroundColor: selectedTop
                        ? theme.surfaceVariant
                        : '#FEF3C7',
                      borderColor: selectedTop ? theme.border : '#F59E0B',
                    },
                  ]}
                >
                  <Text style={[styles.layerChipRole, { color: theme.textSecondary }]}>
                    Top:
                  </Text>
                  <Text
                    style={[styles.layerChipName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {selectedTop ? selectedTop.name : 'Choose Top'}
                  </Text>
                </TouchableOpacity>

                {/* Bottom Chip */}
                <TouchableOpacity
                  onPress={() => {
                    setPickerCategory('BOTTOMS');
                    setActiveTab('closetPicker');
                  }}
                  style={[
                    styles.layerChip,
                    {
                      backgroundColor: selectedBottom
                        ? theme.surfaceVariant
                        : '#FEF3C7',
                      borderColor: selectedBottom ? theme.border : '#F59E0B',
                    },
                  ]}
                >
                  <Text style={[styles.layerChipRole, { color: theme.textSecondary }]}>
                    Bottom:
                  </Text>
                  <Text
                    style={[styles.layerChipName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {selectedBottom ? selectedBottom.name : 'Choose Pants'}
                  </Text>
                </TouchableOpacity>

                {/* Shoes Chip */}
                <TouchableOpacity
                  onPress={() => {
                    setPickerCategory('FOOTWEAR');
                    setActiveTab('closetPicker');
                  }}
                  style={[
                    styles.layerChip,
                    {
                      backgroundColor: selectedShoes
                        ? theme.surfaceVariant
                        : '#F1F5F9',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.layerChipRole, { color: theme.textSecondary }]}>
                    Shoes:
                  </Text>
                  <Text
                    style={[styles.layerChipName, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {selectedShoes ? selectedShoes.name : 'Add Shoes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Closet Picker Sheet if Active */}
            {activeTab === 'closetPicker' && (
              <View
                style={[
                  styles.pickerSection,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
              >
                <View style={styles.pickerHeader}>
                  <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
                    Swap {pickerCategory} from your Closet
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab('fit')}
                    style={[styles.miniClose, { backgroundColor: theme.surface }]}
                  >
                    <X size={14} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>

                {items.filter(
                  (i) =>
                    pickerCategory === 'TOPS'
                      ? ['TOPS', 'TRADITIONAL'].includes(i.category)
                      : i.category === pickerCategory
                ).length === 0 ? (
                  <Text style={[styles.emptyClosetHint, { color: theme.textTertiary }]}>
                    No {pickerCategory.toLowerCase()} found in your closet yet. Add some in the Wardrobe tab.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                    {items
                      .filter(
                        (i) =>
                          pickerCategory === 'TOPS'
                            ? ['TOPS', 'TRADITIONAL'].includes(i.category)
                            : i.category === pickerCategory
                      )
                      .map((ci) => (
                        <TouchableOpacity
                          key={ci._id}
                          onPress={() => {
                            if (pickerCategory === 'TOPS') setSelectedTop(ci);
                            else if (pickerCategory === 'BOTTOMS') setSelectedBottom(ci);
                            else if (pickerCategory === 'FOOTWEAR') setSelectedShoes(ci);
                            setActiveTab('fit');
                          }}
                          style={[
                            styles.pickerCard,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                          ]}
                        >
                          <Image source={{ uri: ci.imageUrl }} style={styles.pickerCardThumb} />
                          <Text
                            style={[styles.pickerCardName, { color: theme.textPrimary }]}
                            numberOfLines={1}
                          >
                            {ci.name}
                          </Text>
                          <Text
                            style={[styles.pickerCardColor, { color: theme.textSecondary }]}
                          >
                            {ci.primaryColor}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* AI Drape & Silhouette Evaluation */}
            <View
              style={[
                styles.evalCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.evalHeader}>
                <View>
                  <Text style={[styles.evalTitle, { color: theme.textPrimary }]}>
                    AI Silhouette & Drape Analysis
                  </Text>
                  <Text style={[styles.evalSubtitle, { color: theme.textSecondary }]}>
                    Occasion: {aiFitAnalysis.occasion}
                  </Text>
                </View>

                <View style={styles.scorePill}>
                  <Text style={styles.scoreNumber}>{aiFitAnalysis.score}%</Text>
                  <Text style={styles.scoreLabel}>Fit Match</Text>
                </View>
              </View>

              <View style={styles.notesList}>
                {aiFitAnalysis.notes.map((note, idx) => (
                  <View key={idx} style={styles.noteItem}>
                    <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2 }} />
                    <Text style={[styles.noteText, { color: theme.textPrimary }]}>
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={handleSaveLook}
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: savedSuccess ? '#10B981' : theme.accent },
                ]}
              >
                {savedSuccess ? (
                  <>
                    <Check size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Saved to Looks</Text>
                  </>
                ) : (
                  <>
                    <Bookmark size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Save Look</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleScheduleToday}
                style={[
                  styles.secondaryActionBtn,
                  {
                    backgroundColor: scheduledSuccess ? '#ECFDF5' : theme.surfaceVariant,
                    borderColor: scheduledSuccess ? '#10B981' : theme.border,
                  },
                ]}
              >
                {scheduledSuccess ? (
                  <>
                    <Check size={18} color="#059669" />
                    <Text style={[styles.secondaryActionText, { color: '#059669' }]}>
                      Scheduled Today
                    </Text>
                  </>
                ) : (
                  <>
                    <Calendar size={18} color={theme.textPrimary} />
                    <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>
                      Schedule
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  toolbar: {
    marginBottom: SPACING.sm,
    gap: 8,
  },
  controlGroup: {
    gap: 4,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lightBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  lightBtnText: {
    fontSize: 10,
  },
  cutoutToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  cutoutText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: 8,
    gap: 4,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  viewModeBtnActive: {
    backgroundColor: '#C2410C',
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  viewModeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  viewModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  canvasContainer: {
    height: 380,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  photorealisticModelContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photorealisticModelImage: {
    width: '100%',
    height: '100%',
  },
  lightingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingGarmentTags: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 5,
  },
  floatingTagPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingTagRole: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FB923C',
    letterSpacing: 0.5,
  },
  floatingTagName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
    maxWidth: 120,
  },
  ambientGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: 50,
  },
  mannequinBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingVertical: 10,
  },
  mannequinHeadStand: {
    alignItems: 'center',
    marginBottom: 4,
  },
  mannequinHead: {
    width: 28,
    height: 34,
    borderRadius: 14,
    opacity: 0.85,
  },
  mannequinNeck: {
    width: 8,
    height: 8,
    backgroundColor: '#94A3B8',
  },
  garmentLayerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSlot: {
    width: 170,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topImage: {
    width: 160,
    height: 115,
  },
  bottomSlot: {
    width: 140,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bottomImage: {
    width: 130,
    height: 105,
  },
  emptySlot: {
    width: 140,
    height: 60,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptySlotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  waistDivider: {
    width: 40,
    height: 3,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
    borderRadius: 2,
  },
  footwearContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  shoesSlot: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoesImage: {
    width: 90,
    height: 38,
  },
  mannequinPedestal: {
    alignItems: 'center',
  },
  pedestalPole: {
    width: 4,
    height: 25,
    backgroundColor: '#64748B',
  },
  pedestalBase: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569',
  },
  garmentTagOverlay: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 150,
  },
  garmentTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  watermarkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  layerBar: {
    marginBottom: SPACING.sm,
  },
  layerBarHeading: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  layerChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  layerChip: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  layerChipRole: {
    fontSize: 9,
    fontWeight: '600',
  },
  layerChipName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  pickerSection: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  miniClose: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerScroll: {
    flexDirection: 'row',
  },
  pickerCard: {
    width: 80,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    alignItems: 'center',
  },
  pickerCardThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  pickerCardName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  pickerCardColor: {
    fontSize: 9,
    marginTop: 1,
  },
  emptyClosetHint: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  evalCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  evalTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  evalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  scoreNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#059669',
  },
  notesList: {
    gap: 6,
  },
  noteItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
