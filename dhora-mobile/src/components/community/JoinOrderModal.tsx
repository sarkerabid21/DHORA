import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Tag, MapPin, AlertCircle, ShoppingBag } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../common/Button';
import { CommunityBuyPost } from '../../types/communityBuy';

interface JoinOrderModalProps {
  visible: boolean;
  onClose: () => void;
  post: CommunityBuyPost;
  onJoin: (data: {
    size: string;
    color: string;
    quantity: number;
    contactPhone: string;
  }) => Promise<void>;
}

export const JoinOrderModal: React.FC<JoinOrderModalProps> = ({
  visible,
  onClose,
  post,
  onJoin,
}) => {
  const { isDarkMode, theme } = useThemeStore();

  const [selectedSize, setSelectedSize] = useState<string>(
    post.availableSizes?.[0] || 'M'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    post.availableColors?.[0] || 'Default'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const totalPrice = quantity * post.unitPrice;

  const handleSubmit = async () => {
    if (!phone || phone.trim().length < 10) {
      Alert.alert(
        'Phone Number Required',
        'Please enter a valid mobile number for the parcel arrival SMS & pickup coordination.'
      );
      return;
    }

    try {
      setSubmitting(true);
      await onJoin({
        size: selectedSize,
        color: selectedColor,
        quantity,
        contactPhone: phone.trim(),
      });
      setSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err.message || 'Could not join order.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.content,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Join Group Buy
              </Text>
              <Text
                style={[styles.productName, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {post.productName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            {/* STRICT INVARIANT NOTICE */}
            <View
              style={[
                styles.noticeBox,
                {
                  backgroundColor: isDarkMode ? '#2B1A0A' : '#FEF3C7',
                  borderColor: isDarkMode ? '#59340D' : '#FDE68A',
                },
              ]}
            >
              <AlertCircle size={18} color="#D97706" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
                  Community Invariant:
                </Text>
                <Text style={[styles.noticeText, { color: isDarkMode ? '#FDE68A' : '#78350F' }]}>
                  Posting comments in the thread asks questions only and does NOT place an order.
                  Submitting this form creates your binding order with a secure pickup token.
                </Text>
              </View>
            </View>

            {/* Savings & Price Card */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: isDarkMode ? '#1E1E24' : '#F8F9FA' },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Item Price
                </Text>
                <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                  ৳{post.unitPrice} each
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Tag size={14} color="#10B981" />
                  <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '600' }}>
                    Combined Courier Saving
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#10B981', fontWeight: '700' }}>
                  Save ৳{post.deliverySavingPerPerson}
                </Text>
              </View>
            </View>

            {/* Size Selector */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Select Size</Text>
            <View style={styles.chipsRow}>
              {post.availableSizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSize(s)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.accent
                          : isDarkMode
                          ? '#282832'
                          : '#F1F3F5',
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color Selector */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Select Color</Text>
            <View style={styles.chipsRow}>
              {post.availableColors.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.accent
                          : isDarkMode
                          ? '#282832'
                          : '#F1F3F5',
                        borderColor: isSelected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quantity Stepper */}
            <View style={styles.quantitySection}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0 }]}>
                Quantity
              </Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.textPrimary }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.textPrimary }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(4, quantity + 1))}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Safe Public Pickup Point Reminder */}
            <View
              style={[
                styles.pickupLocationBox,
                { backgroundColor: isDarkMode ? '#172554' : '#EFF6FF', borderColor: '#3B82F6' },
              ]}
            >
              <MapPin size={16} color="#3B82F6" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pickupTitle, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
                  Safe Public Pickup Venue:
                </Text>
                <Text style={[styles.pickupText, { color: isDarkMode ? '#BFDBFE' : '#1E3A8A' }]}>
                  {post.publicPickupLocation}
                </Text>
              </View>
            </View>

            {/* Contact Phone */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>
              Contact Phone (for Pickup Arrival)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#282832' : '#FFFFFF',
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g. 01712345678"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Total Footer */}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                Total to Pay on Delivery:
              </Text>
              <Text style={[styles.totalAmount, { color: theme.accent }]}>
                ৳{totalPrice}
              </Text>
            </View>
          </ScrollView>

          <Button
            title={`Confirm Group Order (৳${totalPrice})`}
            variant="accent"
            onPress={handleSubmit}
            loading={submitting}
            icon={<ShoppingBag size={18} color="#FFFFFF" />}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  productName: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pickupLocationBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  pickupTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pickupText: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
});
