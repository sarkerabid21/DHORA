import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, User as UserIcon, Mail } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from './Button';
import { SPACING, RADIUS } from '../../constants/theme';

export interface GoogleAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, fullName: string, avatarUrl?: string) => Promise<void>;
  isLoading?: boolean;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  visible,
  onClose,
  onSelectAccount,
  isLoading = false,
}) => {
  const { theme } = useThemeStore();
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [error, setError] = useState('');

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setError('Please enter a valid Google Gmail address.');
      return;
    }
    const name = googleName.trim() || googleEmail.split('@')[0];
    setError('');
    await onSelectAccount(
      googleEmail.trim().toLowerCase(),
      name,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.googleBrandRow}>
              <View style={styles.googleIconBadge}>
                <Text style={styles.googleIconG}>G</Text>
              </View>
              <View>
                <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
                  Sign in with Google
                </Text>
                <Text style={[styles.dialogSubtitle, { color: theme.textSecondary }]}>
                  to continue to DHORA Fashion
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceVariant }]}
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              Enter Your Google Account Information
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Google Gmail Address
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Mail size={16} color={theme.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="your.email@gmail.com"
                  placeholderTextColor={theme.textTertiary}
                  value={googleEmail}
                  onChangeText={setGoogleEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Your Name on Google Account
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: theme.border,
                  },
                ]}
              >
                <UserIcon size={16} color={theme.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="e.g. Shakib Al Hasan"
                  placeholderTextColor={theme.textTertiary}
                  value={googleName}
                  onChangeText={setGoogleName}
                />
              </View>
            </View>

            <Button
              title="Continue with Google"
              variant="accent"
              size="lg"
              loading={isLoading}
              onPress={handleSubmit}
              style={{ marginTop: SPACING.sm, marginBottom: SPACING.md }}
            />

            <Text style={[styles.disclaimerText, { color: theme.textTertiary }]}>
              DHORA will securely authenticate your Google identity to create your private, isolated wardrobe and personalize your AI styling experience.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  googleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIconG: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dialogSubtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: SPACING.lg,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
});
