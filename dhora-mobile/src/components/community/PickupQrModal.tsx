import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { X, ShieldCheck, MapPin, Copy, CheckCircle2 } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../common/Button';

interface PickupQrModalProps {
  visible: boolean;
  onClose: () => void;
  order: {
    pickupUniqueCode: string;
    productName?: string;
    status: string;
    publicPickupLocation?: string;
    pickupInstructions?: string;
    size?: string;
    color?: string;
    quantity?: number;
  } | null;
}

export const PickupQrModal: React.FC<PickupQrModalProps> = ({
  visible,
  onClose,
  order,
}) => {
  const { isDarkMode, theme } = useThemeStore();

  if (!order) return null;

  const handleCopyCode = () => {
    Alert.alert('Code Copied', `Collection code ${order.pickupUniqueCode} ready to show.`);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={20} color="#10B981" />
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Pickup Verification Pass
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Verification Code Card */}
          <View
            style={[
              styles.codeCard,
              {
                backgroundColor: isDarkMode ? '#1E1E24' : '#F8F9FA',
                borderColor: theme.accent,
              },
            ]}
          >
            <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
              YOUR COLLECTION TOKEN
            </Text>
            <Text style={[styles.codeDigits, { color: theme.accent }]}>
              {order.pickupUniqueCode}
            </Text>
            <Text style={[styles.codeNotice, { color: theme.textSecondary }]}>
              Show this code to the group coordinator when receiving your item
            </Text>

            <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
              <Copy size={14} color={theme.accent} />
              <Text style={[styles.copyBtnText, { color: theme.accent }]}>
                Copy Token
              </Text>
            </TouchableOpacity>
          </View>

          {/* Item details */}
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, { color: theme.textPrimary }]}>
              {order.productName || 'Group Buy Item'}
            </Text>
            <Text style={[styles.itemVariant, { color: theme.textSecondary }]}>
              {order.size} • {order.color} • Qty: {order.quantity || 1}
            </Text>
          </View>

          {/* Venue & Safety */}
          {order.publicPickupLocation && (
            <View
              style={[
                styles.locationBox,
                {
                  backgroundColor: isDarkMode ? '#182438' : '#EFF6FF',
                  borderColor: '#3B82F6',
                },
              ]}
            >
              <MapPin size={16} color="#3B82F6" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationTitle, { color: '#2563EB' }]}>
                  Designated Public Venue
                </Text>
                <Text style={[styles.locationText, { color: theme.textPrimary }]}>
                  {order.publicPickupLocation}
                </Text>
                {order.pickupInstructions && (
                  <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
                    {order.pickupInstructions}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.safetyBox}>
            <CheckCircle2 size={14} color="#10B981" />
            <Text style={[styles.safetyText, { color: theme.textSecondary }]}>
              DHORA Guarantee: All handoffs happen in pre-verified public areas.
            </Text>
          </View>

          <Button
            title="Done"
            variant="accent"
            onPress={onClose}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  codeCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeDigits: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  codeNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemRow: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  locationBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 11,
    marginTop: 2,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  safetyText: {
    fontSize: 11,
    flex: 1,
  },
});
