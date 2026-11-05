import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mail,
  Lock,
  User as UserIcon,
  CheckSquare,
  Square,
  ChevronLeft,
  KeyRound,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { GoogleAccountModal } from '../../src/components/common/GoogleAccountModal';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    register,
    sendOtp,
    loginWithGoogle,
    loginAsGuest,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    consent?: string;
    otp?: string;
  }>({});

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!consentAgreed) {
      errors.consent = 'You must agree to the Terms of Service';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async () => {
    clearError();
    if (!validateForm()) return;

    const res = await register(fullName.trim(), email.trim(), password);
    if (res.otpRequired) {
      setDevOtp(res.devOtp || '');
      setStep('OTP');
      setResendCooldown(30);
    } else if (res.success) {
      router.replace('/(tabs)');
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    if (!otp.trim() || otp.trim().length < 4) {
      setFieldErrors({ otp: 'Please enter the 6-digit verification code.' });
      return;
    }

    const res = await register(fullName.trim(), email.trim(), password, otp.trim());
    if (res.success) {
      router.replace('/(tabs)');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    clearError();
    const res = await sendOtp(email.trim());
    if (res.success) {
      if (res.devOtp) setDevOtp(res.devOtp);
      setResendCooldown(45);
    }
  };

  const handleSelectGoogleAccount = async (
    googleEmail: string,
    googleName: string,
    googleAvatar?: string
  ) => {
    clearError();
    const success = await loginWithGoogle(googleEmail, googleName, googleAvatar);
    if (success) {
      setIsGoogleModalOpen(false);
      router.replace('/(tabs)');
    }
  };

  const handleGuestRegister = async () => {
    clearError();
    const success = await loginAsGuest();
    if (success) {
      router.replace('/(tabs)');
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
            onPress={() => {
              if (step === 'OTP') {
                setStep('FORM');
                setOtp('');
              } else {
                router.back();
              }
            }}
            style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}
          >
            <ChevronLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.brandBadge, { backgroundColor: '#FFFFFF', borderColor: theme.border }]}>
              <Image
                source={require('../../assets/dhora-logo.jpg')}
                style={styles.brandBadgeImg}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {step === 'FORM' ? 'Create Your Closet' : 'Verify Your Email'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {step === 'FORM'
                ? 'Join DHORA to unlock smart AI outfit recommendations and an organized wardrobe.'
                : `We've sent a 6-digit verification code to ${email}. Enter it below to activate your account.`}
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {step === 'FORM' ? (
            /* ================= STEP 1: REGISTRATION FORM ================= */
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="e.g. Tanvir Ahmed"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fieldErrors.fullName)
                    setFieldErrors({ ...fieldErrors, fullName: undefined });
                }}
                leftIcon={<UserIcon size={18} color={theme.textTertiary} />}
                error={fieldErrors.fullName}
              />

              <Input
                label="Email Address"
                placeholder="tanvir@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email)
                    setFieldErrors({ ...fieldErrors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={theme.textTertiary} />}
                error={fieldErrors.email}
              />

              <Input
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password)
                    setFieldErrors({ ...fieldErrors, password: undefined });
                }}
                secureTextEntry
                leftIcon={<Lock size={18} color={theme.textTertiary} />}
                error={fieldErrors.password}
              />

              {/* Terms Consent */}
              <TouchableOpacity
                onPress={() => {
                  setConsentAgreed(!consentAgreed);
                  if (fieldErrors.consent)
                    setFieldErrors({ ...fieldErrors, consent: undefined });
                }}
                style={styles.consentRow}
                activeOpacity={0.8}
              >
                {consentAgreed ? (
                  <CheckSquare size={20} color={theme.accent} />
                ) : (
                  <Square size={20} color={theme.textTertiary} />
                )}
                <Text style={[styles.consentText, { color: theme.textSecondary }]}>
                  I agree to DHORA's{' '}
                  <Text style={{ color: theme.accent, fontWeight: '600' }}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={{ color: theme.accent, fontWeight: '600' }}>
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </TouchableOpacity>
              {fieldErrors.consent && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {fieldErrors.consent}
                </Text>
              )}

              <Button
                title="Create Account"
                variant="accent"
                size="lg"
                loading={isLoading}
                onPress={handleRegisterSubmit}
                style={styles.submitBtn}
              />

              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textTertiary }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <Button
                title="Continue with Google"
                variant="outline"
                size="md"
                onPress={() => setIsGoogleModalOpen(true)}
              />

              <TouchableOpacity
                onPress={handleGuestRegister}
                style={[
                  styles.guestBtn,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.guestBtnText, { color: theme.accent }]}>
                  ⚡ Instant Preview as Guest (1-Tap Demo)
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= STEP 2: OTP VERIFICATION VIEW ================= */
            <View style={styles.form}>
              {/* Email Badge */}
              <View
                style={[
                  styles.emailBadge,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
              >
                <Mail size={16} color={theme.accent} />
                <Text style={[styles.emailBadgeText, { color: theme.textPrimary }]}>
                  {email}
                </Text>
              </View>

              {/* Dev/Demo OTP Highlight Badge */}
              {devOtp ? (
                <View style={[styles.devOtpCard, { backgroundColor: theme.accentLight }]}>
                  <Text style={[styles.devOtpLabel, { color: theme.accent }]}>
                    ⚡ SIMULATED EMAIL INBOX / TEST CODE
                  </Text>
                  <Text style={[styles.devOtpCode, { color: theme.accent }]}>
                    {devOtp}
                  </Text>
                  <Text style={[styles.devOtpHint, { color: theme.textSecondary }]}>
                    Use this code to verify immediately, or check server logs.
                  </Text>
                </View>
              ) : null}

              {/* OTP Input Field */}
              <View style={styles.otpInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Enter 6-Digit Code
                </Text>
                <View
                  style={[
                    styles.otpContainer,
                    {
                      backgroundColor: theme.surface,
                      borderColor: fieldErrors.otp ? theme.error : theme.border,
                    },
                  ]}
                >
                  <KeyRound size={20} color={theme.textTertiary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.otpTextInput, { color: theme.textPrimary }]}
                    placeholder="e.g. 123456"
                    placeholderTextColor={theme.textTertiary}
                    value={otp}
                    onChangeText={(t) => {
                      setOtp(t);
                      if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: undefined });
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                {fieldErrors.otp && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {fieldErrors.otp}
                  </Text>
                )}
              </View>

              <Button
                title="Verify & Open My Closet"
                variant="accent"
                size="lg"
                loading={isLoading}
                onPress={handleVerifyOtp}
                style={styles.submitBtn}
              />

              {/* Resend & Edit Email Buttons */}
              <View style={styles.otpActionRow}>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0}
                  style={styles.resendBtn}
                >
                  <RefreshCw size={14} color={resendCooldown > 0 ? theme.textTertiary : theme.accent} />
                  <Text
                    style={[
                      styles.resendBtnText,
                      { color: resendCooldown > 0 ? theme.textTertiary : theme.accent },
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setStep('FORM');
                    setOtp('');
                  }}
                  style={styles.changeEmailBtn}
                >
                  <Text style={[styles.changeEmailText, { color: theme.textSecondary }]}>
                    Change Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: theme.accent }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Account Modal */}
      <GoogleAccountModal
        visible={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  brandBadgeImg: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
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
  },
  form: {
    marginBottom: SPACING.lg,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  consentText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  submitBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  guestBtn: {
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.md,
  },
  emailBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  devOtpCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  devOtpLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  devOtpCode: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
    marginVertical: 4,
  },
  devOtpHint: {
    fontSize: 11,
  },
  otpInputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
  },
  otpTextInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
  },
  otpActionRow: {
    alignItems: 'center',
    gap: 12,
    marginTop: SPACING.xs,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  changeEmailBtn: {
    paddingVertical: 4,
  },
  changeEmailText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
