import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Camera,
  Image as ImageIcon,
  Check,
  Tag,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useRentalStore } from '../../stores/rentalStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { Button } from '../common/Button';
import { SPACING, RADIUS } from '../../constants/theme';

import { RentalCondition } from '../../types/marketplace';

interface CreateRentalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (newListing: any) => void;
}

const CATEGORIES = ['TRADITIONAL', 'OUTERWEAR', 'TOPS', 'BOTTOMS', 'FORMAL'];
const SIZES = ['S', 'M', 'L', 'XL', 'Free Size'];
const CONDITIONS: { label: string; value: RentalCondition }[] = [
  { label: 'Brand New', value: 'BRAND_NEW' },
  { label: 'Like New (Worn Once)', value: 'LIKE_NEW' },
  { label: 'Good Condition', value: 'GOOD' },
];

export const CreateRentalModal: React.FC<CreateRentalModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { theme, isDarkMode } = useThemeStore();
  const { createListing } = useRentalStore();
  const { items: wardrobeItems } = useWardrobeStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TRADITIONAL');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState<RentalCondition>('LIKE_NEW');
  const [dailyRentalPrice, setDailyRentalPrice] = useState('600');
  const [securityDeposit, setSecurityDeposit] = useState('1500');
  const [locationArea, setLocationArea] = useState('Dhaka (Dhanmondi)');
  const [pickupAddressInstruction, setPickupAddressInstruction] = useState(
    'Meet at public mall front or courier delivery available.'
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedWardrobeItemId, setSelectedWardrobeItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from wardrobe item selection
  const handleSelectFromWardrobe = (item: any) => {
    setSelectedWardrobeItemId(item._id);
    setTitle(item.name || 'Festive Garment');
    setImageUri(item.imageUrl || null);
    if (item.category === 'TRADITIONAL' || item.category === 'OUTERWEAR') {
      setCategory(item.category);
    }
  };

  // Direct Photo Pickers
  const handlePickFromGallery = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission', 'Photo gallery access is needed to select garment photo.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImageUri(uri);
        setSelectedWardrobeItemId(null);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const handleCaptureCamera = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert('Camera Permission', 'Camera access is required to take garment photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImageUri(uri);
        setSelectedWardrobeItemId(null);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a garment title or select an item from your closet.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Photo Required', 'Please snap a photo or choose from gallery/closet.');
      return;
    }
    if (!dailyRentalPrice || isNaN(Number(dailyRentalPrice))) {
      Alert.alert('Required', 'Please enter daily rental price in BDT.');
      return;
    }
    if (!securityDeposit || isNaN(Number(securityDeposit))) {
      Alert.alert('Required', 'Please enter security deposit in BDT.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newListing = await createListing({
        clothingItemId: selectedWardrobeItemId || undefined,
        title: title.trim(),
        description:
          description.trim() ||
          'Dry-cleaned festive occasionwear in pristine condition. Ready for wedding or party rental.',
        category: category as any,
        size,
        condition,
        dailyRentalPrice: Number(dailyRentalPrice),
        securityDeposit: Number(securityDeposit),
        minRentalDays: 2,
        maxRentalDays: 7,
        locationArea: locationArea.trim(),
        pickupAddressInstruction: pickupAddressInstruction.trim(),
        images: [imageUri],
        rentalPolicy:
          'Item is dry-cleaned before dispatch. Renter must return without permanent alteration in original cover.',
        status: 'AVAILABLE',
      });

      setIsSubmitting(false);
      Alert.alert(
        'Published to DHORA Rent! 🎉',
        `Your listing "${title}" is now active in the rental marketplace. Other users can view and book it with verified escrow protection.`,
        [
          {
            text: 'View Marketplace',
            onPress: () => {
              onClose();
              if (onSuccess) onSuccess(newListing);
            },
          },
        ]
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Publish Failed', err.message || 'Could not publish rental listing.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                List Clothes for Rent (ভাড়া দিন)
              </Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                Earn by renting out party & wedding wear safely
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Quick Pick from Wardrobe */}
            {wardrobeItems.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  1. Pick from Your Digital Closet (Auto-fill):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={styles.wardrobeRow}>
                    {wardrobeItems.map((item) => {
                      const isSelected = selectedWardrobeItemId === item._id;
                      return (
                        <TouchableOpacity
                          key={item._id}
                          onPress={() => handleSelectFromWardrobe(item)}
                          style={[
                            styles.wardrobeThumbCard,
                            {
                              borderColor: isSelected ? theme.accent : theme.border,
                              backgroundColor: isSelected ? theme.accentLight : theme.surface,
                            },
                          ]}
                        >
                          <Image source={{ uri: item.imageUrl }} style={styles.wardrobeThumb} />
                          <Text numberOfLines={1} style={[styles.wardrobeThumbText, { color: theme.textPrimary }]}>
                            {item.name}
                          </Text>
                          {isSelected && (
                            <View style={[styles.checkBadge, { backgroundColor: theme.accent }]}>
                              <Check size={10} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Photo Selection / Camera */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {wardrobeItems.length > 0 ? 'Or Photograph / Upload Photo:' : '1. Garment Photo:'}
            </Text>

            {imageUri ? (
              <View style={[styles.previewCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.previewTitle, { color: theme.textPrimary }]}>Photo Attached</Text>
                  <Text style={[styles.previewSub, { color: theme.textSecondary }]}>
                    High-res occasionwear preview
                  </Text>
                  <View style={styles.previewBtnRow}>
                    <TouchableOpacity
                      onPress={handlePickFromGallery}
                      style={[styles.smallBtn, { backgroundColor: theme.surfaceVariant }]}
                    >
                      <Text style={[styles.smallBtnText, { color: theme.textPrimary }]}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setImageUri(null);
                        setSelectedWardrobeItemId(null);
                      }}
                      style={[styles.smallBtn, { backgroundColor: '#FEE2E2' }]}
                    >
                      <Text style={[styles.smallBtnText, { color: '#DC2626' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.uploadRow}>
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <ImageIcon size={22} color={theme.accent} />
                  <Text style={[styles.uploadBoxText, { color: theme.textPrimary }]}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCaptureCamera}
                  style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <Camera size={22} color={theme.accent} />
                  <Text style={[styles.uploadBoxText, { color: theme.textPrimary }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Garment Title */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Item Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="e.g. Royal Dhakai Jamdani Silk Panjabi"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Category */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Category</Text>
            <View style={styles.chipsWrap}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Size */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Size</Text>
            <View style={styles.chipsWrap}>
              {SIZES.map((sz) => {
                const isSelected = size === sz;
                return (
                  <TouchableOpacity
                    key={sz}
                    onPress={() => setSize(sz)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                      {sz}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Condition */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Condition</Text>
            <View style={styles.chipsWrap}>
              {CONDITIONS.map((c) => {
                const isSelected = condition === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => setCondition(c.value as any)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pricing Row */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Daily Rental Fee (৳)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="650"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={dailyRentalPrice}
                  onChangeText={setDailyRentalPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Security Deposit (৳)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="1500"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                />
              </View>
            </View>

            {/* Location Area */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Your Location / Area</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="e.g. Dhaka (Dhanmondi), Banani, Gulshan, Uttara..."
              placeholderTextColor={theme.textSecondary}
              value={locationArea}
              onChangeText={setLocationArea}
            />

            {/* Handover Instruction */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Pickup & Handover Instruction</Text>
            <TextInput
              style={[styles.inputArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="e.g. Meet at Dhanmondi 27 Star Kabab or Courier available via Pathao Parcel."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={2}
              value={pickupAddressInstruction}
              onChangeText={setPickupAddressInstruction}
            />

            {/* Escrow Protection Assurance Banner */}
            <View
              style={[
                styles.escrowBanner,
                { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' },
              ]}
            >
              <ShieldCheck size={18} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.escrowTitle, { color: '#047857' }]}>
                  DHORA 7-Stage Escrow Protection
                </Text>
                <Text style={[styles.escrowSub, { color: theme.textSecondary }]}>
                  Your security deposit is locked in escrow before handover. Pre and post-inspection photos guarantee zero-dispute returns.
                </Text>
              </View>
            </View>

            {/* Publish Button */}
            <Button
              title="Publish to DHORA Rent (ভাড়া দিন) ✨"
              variant="accent"
              size="lg"
              loading={isSubmitting}
              onPress={handlePublish}
              style={{ marginTop: 12, marginBottom: 24 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  wardrobeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 6,
  },
  wardrobeThumbCard: {
    width: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 6,
    alignItems: 'center',
    position: 'relative',
  },
  wardrobeThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  wardrobeThumbText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  uploadBox: {
    flex: 1,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  previewImage: {
    width: 64,
    height: 76,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  previewBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  inputArea: {
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  escrowBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  escrowSub: {
    fontSize: 11,
    lineHeight: 15,
  },
});
