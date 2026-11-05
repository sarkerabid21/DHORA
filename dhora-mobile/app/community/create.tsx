import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Clock,
  ShieldAlert,
  Camera,
  Image as ImageIcon,
  Trash2,
  MapPin,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useCommunityBuyStore } from '../../src/stores/communityBuyStore';
import { Button } from '../../src/components/common/Button';

const DURATIONS = [
  { label: '1 Hour', minutes: 60 },
  { label: '2 Hours', minutes: 120 },
  { label: '4 Hours', minutes: 240 },
  { label: '8 Hours', minutes: 480 },
  { label: '24 Hours', minutes: 1440 },
];

const PRESET_AREAS = [
  'Dhaka (Dhanmondi)',
  'Dhaka (DU Campus)',
  'Dhaka (Gulshan)',
  'Dhaka (Banani)',
  'Dhaka (Uttara)',
  'Dhaka (Mirpur)',
  'Chattogram (Agrabad)',
  'Sylhet (Zindabazar)',
];

export default function CreateCommunityBuyScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useThemeStore();
  const { createPost } = useCommunityBuyStore();

  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [unitPrice, setUnitPrice] = useState('');
  const [deliverySaving, setDeliverySaving] = useState('120');
  const [targetArea, setTargetArea] = useState('Dhaka (Dhanmondi)');
  const [publicPickupLocation, setPublicPickupLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(120); // 2 hours
  const [maxParticipants, setMaxParticipants] = useState('6');
  const [submitting, setSubmitting] = useState(false);
  const [launchSuccessPost, setLaunchSuccessPost] = useState<any | null>(null);

  // Direct Photo Pickers
  const handlePickFromGallery = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Needed',
          'Photo library access is required to upload clothes for Community Buy.'
        );
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
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setUploadedImageUri(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const handleCaptureCamera = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Camera Permission',
          'Camera access is required to photograph items directly.'
        );
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
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setUploadedImageUri(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      Alert.alert('Required', 'Please enter the clothing/fashion product name.');
      return;
    }
    if (!unitPrice || isNaN(Number(unitPrice))) {
      Alert.alert('Required', 'Please enter a valid item unit price in BDT.');
      return;
    }
    if (!targetArea.trim()) {
      Alert.alert('Required', 'Please enter or select your Target Area/Neighborhood.');
      return;
    }
    if (!publicPickupLocation.trim()) {
      Alert.alert(
        'Public Venue Required',
        'Enter a safe, well-lit public meetup point (e.g., Mall front, Metro station exit, Campus gate).'
      );
      return;
    }

    const finalImage =
      uploadedImageUri ||
      productImageUrl.trim() ||
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600';

    try {
      setSubmitting(true);
      const res = await createPost({
        productName: productName.trim(),
        productUrl: productUrl.trim() || undefined,
        productImageUrl: finalImage,
        unitPrice: Number(unitPrice),
        deliverySavingPerPerson: Number(deliverySaving) || 120,
        targetArea: targetArea.trim(),
        publicPickupLocation: publicPickupLocation.trim(),
        pickupInstructions: pickupInstructions.trim() || undefined,
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: ['Black', 'Navy', 'Grey'],
        durationMinutes: selectedDuration,
        maxParticipants: Number(maxParticipants) || 6,
      });

      setSubmitting(false);

      if (res.success && res.data) {
        setLaunchSuccessPost(res.data);
      } else {
        Alert.alert('Launch Failed', res.message || 'Could not launch group order.');
      }
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Launch Group Buy
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Safety Alert */}
        <View
          style={[
            styles.safetyBanner,
            {
              backgroundColor: isDarkMode ? '#172554' : '#EFF6FF',
              borderColor: '#3B82F6',
            },
          ]}
        >
          <ShieldAlert size={18} color="#2563EB" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.safetyTitle, { color: '#1D4ED8' }]}>
              Public Meetup Guarantee
            </Text>
            <Text style={[styles.safetyDesc, { color: theme.textSecondary }]}>
              DHORA enforces community safety: Never share private home addresses. Only pick
              crowded, verified public meetup points (malls, metro stations, campus gates).
            </Text>
          </View>
        </View>

        {/* Product Details */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Product Information</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Product Name (e.g. Drop-shoulder Oversized Hoodie)"
          placeholderTextColor={theme.textSecondary}
          value={productName}
          onChangeText={setProductName}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Original Store/Shop Link (optional)"
          placeholderTextColor={theme.textSecondary}
          value={productUrl}
          onChangeText={setProductUrl}
        />

        {/* Direct Image Upload Section */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
          Product Image (Direct Upload)
        </Text>

        {uploadedImageUri ? (
          <View style={[styles.previewContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Image source={{ uri: uploadedImageUri }} style={styles.previewImage} />
            <View style={styles.previewMeta}>
              <Text style={[styles.previewTitle, { color: theme.textPrimary }]}>Image Attached ✅</Text>
              <Text style={[styles.previewSub, { color: theme.textSecondary }]}>
                Ready for neighborhood preview
              </Text>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  style={[styles.miniBtn, { backgroundColor: theme.surfaceVariant }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.textPrimary }]}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUploadedImageUri(null)}
                  style={[styles.miniBtn, { backgroundColor: '#FEE2E2' }]}
                >
                  <Trash2 size={13} color="#DC2626" />
                  <Text style={[styles.miniBtnText, { color: '#DC2626' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.uploadCardRow}>
            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={[
                styles.uploadButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={[styles.uploadIconBadge, { backgroundColor: theme.accentLight }]}>
                <ImageIcon size={20} color={theme.accent} />
              </View>
              <Text style={[styles.uploadBtnText, { color: theme.textPrimary }]}>
                Choose from Gallery
              </Text>
              <Text style={[styles.uploadBtnSub, { color: theme.textSecondary }]}>
                Select photo from phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCaptureCamera}
              style={[
                styles.uploadButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={[styles.uploadIconBadge, { backgroundColor: theme.accentLight }]}>
                <Camera size={20} color={theme.accent} />
              </View>
              <Text style={[styles.uploadBtnText, { color: theme.textPrimary }]}>
                Take Photo
              </Text>
              <Text style={[styles.uploadBtnSub, { color: theme.textSecondary }]}>
                Snap with camera
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setShowUrlFallback(!showUrlFallback)}
          style={{ paddingVertical: 4, marginBottom: 8 }}
        >
          <Text style={[styles.toggleUrlText, { color: theme.accent }]}>
            {showUrlFallback ? 'Hide Image URL input' : 'Or enter an Image URL directly →'}
          </Text>
        </TouchableOpacity>

        {showUrlFallback && (
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Image URL (e.g. https://...)"
            placeholderTextColor={theme.textSecondary}
            value={productImageUrl}
            onChangeText={setProductImageUrl}
          />
        )}

        {/* Pricing */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Pricing & Savings</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Unit Price (৳)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={unitPrice}
              onChangeText={setUnitPrice}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Courier Saving/Person (৳)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={deliverySaving}
              onChangeText={setDeliverySaving}
            />
          </View>
        </View>

        {/* Target Area (Editable TextInput + Quick Suggestion Pills) */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
          Target Area / Neighborhood
        </Text>
        <View style={styles.locationInputRow}>
          <View style={[styles.locationIconBox, { backgroundColor: theme.surfaceVariant }]}>
            <MapPin size={18} color={theme.accent} />
          </View>
          <TextInput
            style={[
              styles.locationInput,
              { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary },
            ]}
            placeholder="Type your Area (e.g. Dhanmondi, DU Campus, Uttara, Chittagong...)"
            placeholderTextColor={theme.textSecondary}
            value={targetArea}
            onChangeText={setTargetArea}
          />
        </View>

        <Text style={[styles.subLabel, { color: theme.textSecondary }]}>
          Quick Suggestions (tap to set):
        </Text>
        <View style={styles.chipsRow}>
          {PRESET_AREAS.map((area) => {
            const isSelected = targetArea === area;
            return (
              <TouchableOpacity
                key={area}
                onPress={() => setTargetArea(area)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                  {area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Public Pickup Location */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Safe Public Pickup Point</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Dhanmondi 27 Rapa Plaza Main Gate (Near Gloria Jean's)"
          placeholderTextColor={theme.textSecondary}
          value={publicPickupLocation}
          onChangeText={setPublicPickupLocation}
        />

        <TextInput
          style={[styles.inputArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Pickup coordination notes (e.g. Friday 4-6 PM, have your collection token ready)"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          value={pickupInstructions}
          onChangeText={setPickupInstructions}
        />

        {/* Duration Selection */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
          Countdown Order Duration (Auto-locks on expiry)
        </Text>
        <View style={styles.chipsRow}>
          {DURATIONS.map((d) => {
            const isSelected = selectedDuration === d.minutes;
            return (
              <TouchableOpacity
                key={d.minutes}
                onPress={() => setSelectedDuration(d.minutes)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Clock size={12} color={isSelected ? '#FFFFFF' : theme.textSecondary} />
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Max Participants */}
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Maximum Participants</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Maximum orders to accept (e.g. 6)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
        />

        <Button
          title={submitting ? 'Launching & Adding to Feed... ⏳' : 'Launch Community Order 🚀'}
          variant="accent"
          size="lg"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: 24, marginBottom: 20 }}
        />
      </ScrollView>

      {/* Successfully Launched Modal */}
      <Modal visible={!!launchSuccessPost} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={40} color="#10B981" />
            </View>

            <Text style={[styles.successModalTitle, { color: theme.textPrimary }]}>
              Successfully Done! 🎉
            </Text>
            <Text style={styles.successModalBengali}>
              গ্রুপ অর্ডার সফলভাবে তালিকায় যোগ হয়েছে!
            </Text>
            <Text style={[styles.successModalSub, { color: theme.textSecondary }]}>
              Your group order is now live on the Community Buy list. Neighbors in {launchSuccessPost?.targetArea} can now join to save on delivery fees.
            </Text>

            {launchSuccessPost && (
              <View style={[styles.successItemCard, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
                {launchSuccessPost.productImageUrl ? (
                  <Image source={{ uri: launchSuccessPost.productImageUrl }} style={styles.successItemImage} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.successItemName, { color: theme.textPrimary }]}>
                    {launchSuccessPost.productName}
                  </Text>
                  <Text style={[styles.successItemPrice, { color: theme.accent }]}>
                    ৳{launchSuccessPost.unitPrice} • Saves ৳{launchSuccessPost.deliverySavingPerPerson} Delivery
                  </Text>
                  <Text numberOfLines={1} style={[styles.successItemArea, { color: theme.textSecondary }]}>
                    📍 {launchSuccessPost.targetArea}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.successBtnStack}>
              <TouchableOpacity
                onPress={() => {
                  setLaunchSuccessPost(null);
                  router.replace('/(tabs)/discover?tab=community');
                }}
                style={[styles.primarySuccessBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.primarySuccessBtnText}>
                  📋 View in Community Feed (তালিকায় দেখুন)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const id = launchSuccessPost?._id;
                  setLaunchSuccessPost(null);
                  if (id) router.replace(`/community/${id}`);
                }}
                style={[styles.secondarySuccessBtn, { backgroundColor: theme.surfaceVariant }]}
              >
                <Text style={[styles.secondarySuccessBtnText, { color: theme.textPrimary }]}>
                  🔍 Open Order Page (অর্ডারের বিস্তারিত)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  safetyBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  safetyDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationIconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInput: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputArea: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadCardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  uploadBtnSub: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  previewImage: {
    width: 64,
    height: 76,
    borderRadius: 8,
  },
  previewMeta: {
    flex: 1,
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
  previewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  miniBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleUrlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  successModalBengali: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  successModalSub: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 16,
  },
  successItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    marginBottom: 16,
  },
  successItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  successItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  successItemPrice: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  successItemArea: {
    fontSize: 11,
    marginTop: 2,
  },
  successBtnStack: {
    width: '100%',
    gap: 8,
  },
  primarySuccessBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primarySuccessBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondarySuccessBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondarySuccessBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
