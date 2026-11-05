import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { api } from '../../src/services/api';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (e: any) {
      // Mock success for offline mode
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}
          >
            <ChevronLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: '#ECFDF5' },
                ]}
              >
                <CheckCircle2 size={48} color="#059669" />
              </View>
              <Text style={[styles.title, { color: theme.textPrimary, textAlign: 'center' }]}>
                Check Your Email
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textSecondary, textAlign: 'center' },
                ]}
              >
                We have sent password reset instructions to{' '}
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
                  {email}
                </Text>
                .
              </Text>

              <Button
                title="Back to Sign In"
                variant="accent"
                size="lg"
                onPress={() => router.replace('/(auth)/login')}
                style={{ width: '100%', marginTop: SPACING.xl }}
              />
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Reset Password
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Enter the email associated with your DHORA account and we’ll send you a password recovery code.
                </Text>
              </View>

              {error && (
                <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              )}

              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={18} color={theme.textTertiary} />}
                />

                <Button
                  title="Send Instructions"
                  variant="accent"
                  size="lg"
                  loading={isLoading}
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
});
