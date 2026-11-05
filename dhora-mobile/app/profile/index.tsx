import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  User,
  Moon,
  Sun,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  Shirt,
  Bookmark,
  TrendingUp,
  Briefcase,
  Repeat,
  Users,
  Sparkles,
  MapPin,
  Lock,
  Heart,
  Palette,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { useWardrobeStore } from '../../src/stores/wardrobeStore';
import { useStylistStore } from '../../src/stores/stylistStore';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { Card } from '../../src/components/common/Card';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { api } from '../../src/services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme, theme } = useThemeStore();
  const { reset: resetWardrobe } = useWardrobeStore();
  const { reset: resetStylist } = useStylistStore();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await logout();
        resetWardrobe();
        resetStylist();
      } catch (e) {}
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out of DHORA?');
      if (confirmed) {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of DHORA?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: doLogout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your wardrobe items, AI styling history, and group orders will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/users/me');
              await logout();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required', 'Please fill in current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Too Short', 'New password must be at least 6 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setChangingPassword(false);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Your password has been updated.');
    } catch (err: any) {
      setChangingPassword(false);
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password.');
    }
  };

  const quickLinks = [
    {
      title: 'Digital Wardrobe',
      subtitle: 'Manage your uploaded clothes & laundry',
      icon: <Shirt size={20} color={theme.accent} />,
      route: '/(tabs)/wardrobe',
    },
    {
      title: 'Saved AI Looks',
      subtitle: 'Outfits you bookmarked for later',
      icon: <Bookmark size={20} color={theme.accent} />,
      route: '/outfit/saved',
    },
    {
      title: 'Cost-Per-Wear & Insights',
      subtitle: 'Analytics, gap detector & repetition alerts',
      icon: <TrendingUp size={20} color={theme.accent} />,
      route: '/insights',
    },
    {
      title: 'Trip Capsule Planner',
      subtitle: 'Smart weather packing matrices',
      icon: <Briefcase size={20} color={theme.accent} />,
      route: '/trip',
    },
    {
      title: 'Rental Bookings & Pass',
      subtitle: 'Track your peer-to-peer apparel rentals',
      icon: <Repeat size={20} color={theme.accent} />,
      route: '/rental/manage-bookings',
    },
    {
      title: 'Group Buy Orders & Tokens',
      subtitle: 'Your active parcel tokens & safe public pickups',
      icon: <Users size={20} color={theme.accent} />,
      route: '/community/my-orders',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.textPrimary }]}>
          Profile & Settings
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <Card style={styles.userCard}>
          <View style={styles.userCardRow}>
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.avatarTextLarge, { color: theme.accent }]}>
                {user?.fullName?.charAt(0) || 'D'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>
                {user?.fullName || 'Fashionista'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user?.email || 'user@dhora.app'}
              </Text>

              <View style={styles.locationPill}>
                <MapPin size={12} color={theme.accent} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                  {user?.locationArea || 'Dhanmondi, Dhaka'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/profile-setup')}
              style={[styles.editPencil, { borderColor: theme.border }]}
            >
              <Sparkles size={16} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Theme Mode Toggle Card */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {isDarkMode ? (
                <Moon size={22} color={theme.accent} />
              ) : (
                <Sun size={22} color={theme.accent} />
              )}
              <View>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                  Dark Theme
                </Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  {isDarkMode ? 'Night fashion mode active' : 'Bright editorial light mode'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Fashion Hub Section */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Fashion Hub & Activities
        </Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {quickLinks.map((link, idx) => (
            <TouchableOpacity
              key={link.title}
              onPress={() => router.push(link.route as any)}
              style={[
                styles.linkRow,
                {
                  borderBottomColor: theme.border,
                  borderBottomWidth: idx === quickLinks.length - 1 ? 0 : 1,
                },
              ]}
            >
              <View style={styles.linkIconBox}>{link.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkTitle, { color: theme.textPrimary }]}>
                  {link.title}
                </Text>
                <Text style={[styles.linkSub, { color: theme.textSecondary }]}>
                  {link.subtitle}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Style Preferences Section */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Style Identity & Preferences
        </Text>
        <Card style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Palette size={16} color={theme.accent} />
              <Text style={[styles.prefKey, { color: theme.textSecondary }]}>
                Aesthetic Vibe:
              </Text>
            </View>
            <Text style={[styles.prefVal, { color: theme.textPrimary }]}>
              Casual Chic / Minimalist
            </Text>
          </View>

          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Heart size={16} color={theme.accent} />
              <Text style={[styles.prefKey, { color: theme.textSecondary }]}>
                Favored Palette:
              </Text>
            </View>
            <Text style={[styles.prefVal, { color: theme.textPrimary }]}>
              Charcoal, Earthy, Navy, Olive
            </Text>
          </View>

          <View style={styles.prefRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Shirt size={16} color={theme.accent} />
              <Text style={[styles.prefKey, { color: theme.textSecondary }]}>
                Fit Preference:
              </Text>
            </View>
            <Text style={[styles.prefVal, { color: theme.textPrimary }]}>
              Relaxed / Modern Fit
            </Text>
          </View>

          <Button
            title="Update Style Profile"
            variant="outline"
            size="sm"
            onPress={() => router.push('/(auth)/profile-setup')}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Account & Security Section */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Security & Account
        </Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => setPasswordModalVisible(true)}
            style={[styles.linkRow, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
          >
            <View style={styles.linkIconBox}>
              <Lock size={18} color={theme.textPrimary} />
            </View>
            <Text style={[styles.linkTitle, { color: theme.textPrimary, flex: 1 }]}>
              Change Password
            </Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.linkRow, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
          >
            <View style={styles.linkIconBox}>
              <LogOut size={18} color="#D97706" />
            </View>
            <Text style={[styles.linkTitle, { color: '#D97706', flex: 1 }]}>
              Sign Out
            </Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeleteAccount} style={styles.linkRow}>
            <View style={styles.linkIconBox}>
              <Trash2 size={18} color="#EF4444" />
            </View>
            <Text style={[styles.linkTitle, { color: '#EF4444', flex: 1 }]}>
              Delete Account
            </Text>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Brand Tagline & Version Footer */}
        <View style={styles.brandFooter}>
          <View style={[styles.brandLogoCircle, { backgroundColor: theme.accent }]}>
            <Text style={styles.brandLogoText}>D</Text>
          </View>
          <Text style={[styles.brandName, { color: theme.textPrimary }]}>DHORA</Text>
          <Text style={[styles.brandTagline, { color: theme.accent }]}>
            Style-ta Dhoro, Nijer Moto Cholo
          </Text>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Version 1.0.0 • AI-Powered Fashion Platform
          </Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="Current Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="New Password (min 6 characters)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Button
              title="Save New Password"
              variant="accent"
              loading={changingPassword}
              onPress={handleChangePassword}
              style={{ marginTop: 10 }}
            />
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
  topBar: {
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
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 50,
  },
  userCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    fontSize: 26,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editPencil: {
    padding: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  settingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  linkIconBox: {
    width: 32,
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  linkSub: {
    fontSize: 11,
    marginTop: 1,
  },
  prefCard: {
    padding: SPACING.md,
    gap: 10,
    marginBottom: SPACING.sm,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  prefVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  brandFooter: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  brandLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  versionText: {
    fontSize: 11,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
});
