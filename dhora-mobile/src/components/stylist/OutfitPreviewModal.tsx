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
} from 'react-native';
import {
  X,
  Sparkles,
  Info,
  Bookmark,
  Share2,
  CheckCircle2,
  Shirt,
  Layers,
} from 'lucide-react-native';
import { GroundedOutfit } from '../../types/stylist';
import { useThemeStore } from '../../stores/themeStore';
import { useStylistStore } from '../../stores/stylistStore';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { RADIUS, SPACING } from '../../constants/theme';
import { VirtualMannequinModal } from '../wardrobe/VirtualMannequinModal';
import { resolveModelTryOnImage } from '../../utils/tryOnResolver';

const { width } = Dimensions.get('window');

export interface OutfitPreviewModalProps {
  visible: boolean;
  outfit: GroundedOutfit | null;
  onClose: () => void;
}

export const OutfitPreviewModal: React.FC<OutfitPreviewModalProps> = ({
  visible,
  outfit,
  onClose,
}) => {
  const { theme } = useThemeStore();
  const { saveOutfit, savedLooks } = useStylistStore();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showMannequin, setShowMannequin] = useState(false);
  const [viewMode, setViewMode] = useState<'model' | 'grid'>('model');
  const [modelGender, setModelGender] = useState<'male' | 'female'>('male');

  const modelUrl = useMemo(() => {
    if (!outfit) return '';
    return resolveModelTryOnImage({
      rawOutfitItems: outfit.items,
      gender: modelGender,
    });
  }, [outfit, modelGender]);

  if (!visible || !outfit) return null;

  const isAlreadySaved = (savedLooks || []).some(
    (l) => l._id === outfit._id || l.title === outfit.title
  );

  const handleSave = () => {
    if (!outfit) return;
    saveOutfit(outfit);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

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
                  AI Outfit Visualization
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {outfit.title}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* View Mode Switcher */}
            <View style={[styles.previewSwitcher, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setViewMode('model')}
                style={[
                  styles.previewSwitcherBtn,
                  viewMode === 'model' && [styles.previewSwitcherBtnActive, { backgroundColor: theme.accent }],
                ]}
                activeOpacity={0.8}
              >
                <Sparkles size={14} color={viewMode === 'model' ? '#FFFFFF' : theme.textPrimary} />
                <Text
                  style={[
                    styles.previewSwitcherText,
                    {
                      color: viewMode === 'model' ? '#FFFFFF' : theme.textPrimary,
                      fontWeight: viewMode === 'model' ? '700' : '500',
                    },
                  ]}
                >
                  🧍 Realistic Model Try-On
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                style={[
                  styles.previewSwitcherBtn,
                  viewMode === 'grid' && [styles.previewSwitcherBtnActive, { backgroundColor: theme.accent }],
                ]}
                activeOpacity={0.8}
              >
                <Shirt size={14} color={viewMode === 'grid' ? '#FFFFFF' : theme.textPrimary} />
                <Text
                  style={[
                    styles.previewSwitcherText,
                    {
                      color: viewMode === 'grid' ? '#FFFFFF' : theme.textPrimary,
                      fontWeight: viewMode === 'grid' ? '700' : '500',
                    },
                  ]}
                >
                  👕 Closet Pieces
                </Text>
              </TouchableOpacity>
            </View>

            {/* Visual Look Composition */}
            {viewMode === 'model' ? (
              <View
                style={[
                  styles.modelCanvasContainer,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
              >
                <Image source={{ uri: modelUrl }} style={styles.modelCanvasImage} resizeMode="cover" />

                {/* Model Gender Switcher */}
                <View style={styles.modelGenderSwitcher}>
                  <TouchableOpacity
                    onPress={() => setModelGender('male')}
                    style={[
                      styles.genderPill,
                      modelGender === 'male' && styles.genderPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        modelGender === 'male' && styles.genderPillTextActive,
                      ]}
                    >
                      👨 Male Fit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModelGender('female')}
                    style={[
                      styles.genderPill,
                      modelGender === 'female' && styles.genderPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        modelGender === 'female' && styles.genderPillTextActive,
                      ]}
                    >
                      👩 Female Fit
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Floating Garment Details Pills */}
                <View style={styles.modelOverlayTags}>
                  {(outfit.items || []).slice(0, 2).map((item, idx) => (
                    <View key={idx} style={styles.modelTagPill}>
                      <Text style={styles.modelTagRole}>
                        {(item.role || 'GARMENT').toUpperCase()}
                      </Text>
                      <Text numberOfLines={1} style={styles.modelTagName}>
                        {item.name || 'Wardrobe Item'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Verified Grounded Badge */}
                <View style={styles.verifiedPill}>
                  <CheckCircle2 size={12} color="#059669" />
                  <Text style={styles.verifiedText}>Fitted to Owned Clothes</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.previewContainer,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
              >
                <View style={styles.compositionGrid}>
                  {(outfit.items || []).map((item, idx) => (
                    <View key={idx} style={styles.compositeItem}>
                      <Image
                        source={{
                          uri:
                            item.imageUrl ||
                            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
                        }}
                        style={styles.compositeImage}
                        resizeMode="cover"
                      />
                      <View style={styles.compositeLabel}>
                        <Text style={styles.compositeText}>{item.role || 'Piece'}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Verified Grounded Badge */}
                <View style={styles.verifiedPill}>
                  <CheckCircle2 size={12} color="#059669" />
                  <Text style={styles.verifiedText}>Verified Owned Clothes</Text>
                </View>
              </View>
            )}

            {/* AI Mannequin Studio Trigger */}
            <TouchableOpacity
              onPress={() => setShowMannequin(true)}
              style={[styles.tryOnMannequinBtn, { backgroundColor: theme.accent }]}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.tryOnMannequinText}>👗 Customize Model & Lighting Studio</Text>
            </TouchableOpacity>

            {/* AI Disclaimer Alert Box per Section 12 */}
            <View
              style={[
                styles.disclaimerBox,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Info size={16} color={theme.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.disclaimerTitle, { color: theme.textPrimary }]}>
                  AI Visualization Notice
                </Text>
                <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                  This preview is an AI-generated styling combination derived from your actual wardrobe. Real-world drape, exact fabric texture, and lighting may naturally vary.
                </Text>
              </View>
            </View>

            {/* Styling Rationale */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Occasion & Silhouette Synergy
              </Text>
              <Text style={[styles.rationaleBody, { color: theme.textSecondary }]}>
                {outfit.rationale}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Button
                title={
                  savedSuccess
                    ? 'Saved to Looks!'
                    : isAlreadySaved
                    ? 'Saved in Collection'
                    : 'Save this Look'
                }
                variant={isAlreadySaved ? 'secondary' : 'accent'}
                size="lg"
                onPress={handleSave}
                icon={
                  savedSuccess ? (
                    <CheckCircle2 size={18} color="#059669" />
                  ) : (
                    <Bookmark size={18} color={isAlreadySaved ? theme.accent : '#FFFFFF'} />
                  )
                }
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      <VirtualMannequinModal
        visible={showMannequin}
        onClose={() => setShowMannequin(false)}
        outfit={outfit}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
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
  previewSwitcher: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: SPACING.md,
  },
  previewSwitcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  previewSwitcherBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  previewSwitcherText: {
    fontSize: 12,
  },
  modelCanvasContainer: {
    width: '100%',
    height: 340,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.md,
  },
  modelCanvasImage: {
    width: '100%',
    height: '100%',
  },
  modelGenderSwitcher: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: RADIUS.full,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genderPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  genderPillActive: {
    backgroundColor: '#C2410C',
  },
  genderPillText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  genderPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modelOverlayTags: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 6,
  },
  modelTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  modelTagRole: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
  },
  modelTagName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  previewContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    position: 'relative',
    marginBottom: SPACING.md,
  },
  compositionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  compositeItem: {
    width: (width - 80) / 2,
    height: 140,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  compositeImage: {
    width: '100%',
    height: '100%',
  },
  compositeLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  compositeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  verifiedPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tryOnMannequinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tryOnMannequinText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  verifiedText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  rationaleBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});
