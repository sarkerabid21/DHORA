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
  Sparkles,
  KeyRound,
  RefreshCw,
  ArrowRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { GoogleAccountModal } from '../../src/components/common/GoogleAccountModal';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const {
    login,
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    loginAsGuest,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
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

  const validatePasswordMode = () => {
    const errors: typeof fieldErrors = {};
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
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordLogin = async () => {
    clearError();
    if (!validatePasswordMode()) return;

    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleSendLoginOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setFieldErrors({ email: 'Please enter a valid email address to send code' });
      return;
    }
    clearError();
    const res = await sendOtp(email.trim());
    if (res.success) {
      setOtpSent(true);
      if (res.devOtp) setDevOtp(res.devOtp);
      setResendCooldown(30);
    }
  };

  const handleVerifyLoginOtp = async () => {
    clearError();
    if (!otp.trim() || otp.trim().length < 4) {
      setFieldErrors({ otp: 'Please enter the 6-digit verification code.' });
      return;
    }

    const success = await verifyOtp(email.trim(), otp.trim());
    if (success) {
      router.replace('/(tabs)');
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

  const handleGuestLogin = async () => {
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
          {/* Brand Logo & Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.logoBadge,
                { backgroundColor: '#FFFFFF', borderColor: theme.border },
              ]}
            >
              <Image
                source={require('../../assets/dhora-logo.jpg')}
                style={styles.logoBadgeImg}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
              DHORA
            </Text>
            <Text style={[styles.brandTagline, { color: theme.accent }]}>
              Style-ta Dhoro, Nijer Moto Cholo
            </Text>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
              Log in to your private digital wardrobe and AI stylist.
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View
            style={[
              styles.modeSwitcher,
              { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                clearError();
                setAuthMode('PASSWORD');
              }}
              style={[
                styles.modeTab,
                authMode === 'PASSWORD' && [styles.activeTab, { backgroundColor: theme.surface }],
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: authMode === 'PASSWORD' ? theme.textPrimary : theme.textSecondary,
                    fontWeight: authMode === 'PASSWORD' ? '700' : '500',
                  },
                ]}
              >
                Password Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                clearError();
                setAuthMode('OTP');
              }}
              style={[
                styles.modeTab,
                authMode === 'OTP' && [styles.activeTab, { backgroundColor: theme.surface }],
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: authMode === 'OTP' ? theme.textPrimary : theme.textSecondary,
                    fontWeight: authMode === 'OTP' ? '700' : '500',
                  },
                ]}
              >
                Email OTP Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={theme.textTertiary} />}
              error={fieldErrors.email}
            />

            {authMode === 'PASSWORD' ? (
              /* Password mode */
              <>
                <Input
                  label="Password"
                  placeholder="••••••••"
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

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotBtn}
                >
                  <Text style={[styles.forgotText, { color: theme.accent }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  variant="accent"
                  size="lg"
                  loading={isLoading}
                  onPress={handlePasswordLogin}
                  style={styles.submitBtn}
                />
              </>
            ) : (
              /* Email OTP mode */
              <>
                {!otpSent ? (
                  <Button
                    title="Send Verification Code"
                    variant="accent"
                    size="lg"
                    loading={isLoading}
                    onPress={handleSendLoginOtp}
                    style={styles.submitBtn}
                  />
                ) : (
                  <>
                    {devOtp ? (
                      <View style={[styles.devOtpCard, { backgroundColor: theme.accentLight }]}>
                        <Text style={[styles.devOtpLabel, { color: theme.accent }]}>
                          ⚡ TEST OTP CODE
                        </Text>
                        <Text style={[styles.devOtpCode, { color: theme.accent }]}>
                          {devOtp}
                        </Text>
                      </View>
                    ) : null}

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
                      title="Verify Code & Sign In"
                      variant="accent"
                      size="lg"
                      loading={isLoading}
                      onPress={handleVerifyLoginOtp}
                      style={styles.submitBtn}
                    />

                    <TouchableOpacity
                      onPress={handleSendLoginOtp}
                      disabled={resendCooldown > 0}
                      style={styles.resendBtn}
                    >
                      <RefreshCw
                        size={14}
                        color={resendCooldown > 0 ? theme.textTertiary : theme.accent}
                      />
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
                  </>
                )}
              </>
            )}

            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textTertiary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <Button
              title="Continue with Google"
              variant="outline"
              size="md"
              onPress={() => setIsGoogleModalOpen(true)}
            />

            <TouchableOpacity
              onPress={handleGuestLogin}
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

          {/* Bottom Switch to Register */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account yet?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: theme.accent }]}>
                Create Account
              </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  logoBadgeImg: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  modeTabText: {
    fontSize: 13,
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
    marginBottom: SPACING.md,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
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
  devOtpCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  devOtpLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  devOtpCode: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    marginVertical: 2,
  },
  otpInputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
  },
  otpTextInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: SPACING.sm,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
