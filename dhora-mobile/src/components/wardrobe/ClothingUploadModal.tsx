import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Link2,
  CheckCircle2,
} from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { Button } from '../common/Button';
import { RecognizedAttributes } from '../../types/clothing';
import { SPACING, RADIUS } from '../../constants/theme';

export interface ClothingUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onRecognized: (attributes: RecognizedAttributes, imageUri: string) => void;
}

export const ClothingUploadModal: React.FC<ClothingUploadModalProps> = ({
  visible,
  onClose,
  onRecognized,
}) => {
  const { theme } = useThemeStore();
  const { recognizeImage } = useWardrobeStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Pick from device photo gallery / local files
  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Needed',
          'Gallery access is needed to select clothes from your photo library.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        if (asset.base64) {
          setBase64Data(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setBase64Data(null);
        }
      }
    } catch (err: any) {
      console.warn('Error picking image:', err);
    }
  };

  // Capture real photo with camera
  const handleCaptureCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Needed',
          'Camera access is needed to photograph clothing items directly.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        if (asset.base64) {
          setBase64Data(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setBase64Data(null);
        }
      }
    } catch (err: any) {
      console.warn('Error launching camera:', err);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim().startsWith('http')) {
      setSelectedImage(customUrl.trim());
      setBase64Data(null);
      setShowUrlInput(false);
    } else {
      Alert.alert('Invalid Link', 'Please enter a valid image URL starting with http:// or https://');
    }
  };

  const handleStartAnalysis = async () => {
    setIsUploading(true);
    setUploadProgress(25);

    setTimeout(() => setUploadProgress(60), 300);
    setTimeout(() => setUploadProgress(90), 600);

    try {
      const payloadToSend = base64Data || selectedImage;
      const recognized = await recognizeImage(payloadToSend);
      setUploadProgress(100);
      setIsUploading(false);
      onClose();
      onRecognized(recognized, selectedImage);
    } catch (e) {
      setIsUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Add Clothes to Closet
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Photograph or upload your real garment for AI attribute recognition
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Action Row: Take Photo, Pick Gallery, URL */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleCaptureCamera}
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Camera size={18} color={theme.accent} />
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <ImageIcon size={18} color={theme.accent} />
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                Upload Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowUrlInput(!showUrlInput)}
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Link2 size={18} color={theme.accent} />
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                Web Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Optional URL Input */}
          {showUrlInput && (
            <View style={styles.urlInputRow}>
              <TextInput
                style={[
                  styles.urlInput,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Paste high-res image URL (https://...)"
                placeholderTextColor={theme.textSecondary}
                value={customUrl}
                onChangeText={setCustomUrl}
              />
              <TouchableOpacity
                onPress={handleApplyCustomUrl}
                style={[styles.applyUrlBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.applyUrlText}>Use</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Image Preview or Clean Empty State */}
          {selectedImage ? (
            <View
              style={[
                styles.previewContainer,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.aiCleanPill}>
                <Sparkles size={13} color="#FFFFFF" />
                <Text style={styles.aiCleanText}>Smart Recognition Ready</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setSelectedImage('');
                  setBase64Data(null);
                }}
                style={styles.removeImageBtn}
              >
                <X size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
              style={[
                styles.emptyDropzone,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.dropzoneIconCircle,
                  { backgroundColor: theme.accentLight || 'rgba(194, 65, 12, 0.12)' },
                ]}
              >
                <ImageIcon size={30} color={theme.accent} />
              </View>
              <Text style={[styles.emptyDropzoneTitle, { color: theme.textPrimary }]}>
                No Garment Selected Yet
              </Text>
              <Text style={[styles.emptyDropzoneSubtitle, { color: theme.textSecondary }]}>
                Tap "Camera" or "Upload Photo" above to choose your real clothing item to digitize.
              </Text>
            </TouchableOpacity>
          )}

          {/* Upload Progress Bar if processing */}
          {isUploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressText, { color: theme.textPrimary }]}>
                  {uploadProgress < 100
                    ? 'Gemini Multimodal AI analyzing fabric, color & category...'
                    : 'Recognition complete!'}
                </Text>
                <Text style={[styles.progressPercent, { color: theme.accent }]}>
                  {uploadProgress}%
                </Text>
              </View>
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: theme.accent,
                      width: `${uploadProgress}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <Button
              title="Recognize with Gemini AI"
              variant="accent"
              size="lg"
              disabled={!selectedImage || isUploading}
              loading={isUploading}
              icon={<Sparkles size={18} color="#FFFFFF" />}
              onPress={handleStartAnalysis}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: 270,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  applyUrlBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  applyUrlText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  previewContainer: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    marginVertical: SPACING.xs,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  aiCleanPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  aiCleanText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDropzone: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  dropzoneIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDropzoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDropzoneSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  progressContainer: {
    marginVertical: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    marginTop: SPACING.md,
  },
});
