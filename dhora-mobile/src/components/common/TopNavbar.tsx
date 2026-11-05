import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Bell, MapPin, User as UserIcon } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useStylistStore } from '../../stores/stylistStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { SPACING, RADIUS } from '../../constants/theme';

export interface TopNavbarProps {
  subtitle?: string;
  showWeather?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  subtitle,
  showWeather = true,
}) => {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { weather } = useStylistStore();

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'D';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* Brand Logo & Title */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)')}
        style={styles.brandRow}
      >
        <View style={[styles.logoContainer, { borderColor: theme.border }]}>
          <Image
            source={require('../../../assets/dhora-logo.jpg')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <View>
          <View style={styles.brandTitleRow}>
            <Text style={[styles.brandText, { color: theme.textPrimary }]}>
              DHORA
            </Text>
          </View>
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.subtitleText, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          ) : (
            <View style={styles.locationRow}>
              <MapPin size={10} color={theme.textTertiary} />
              <Text style={[styles.locationText, { color: theme.textTertiary }]}>
                {weather?.city || user?.locationArea || 'Dhaka'} {showWeather && weather?.temperature ? `• ${weather.temperature}°C` : ''}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Right Action Icons */}
      <View style={styles.actionsRow}>
        {/* Notification Bell */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push('/notifications')}
          style={[
            styles.iconButton,
            { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
          ]}
          accessibilityLabel="Notifications"
        >
          <Bell size={17} color={theme.textPrimary} />
          <View style={[styles.notifDot, { backgroundColor: theme.accent }]} />
        </TouchableOpacity>

        {/* User Profile Avatar */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push('/profile')}
          style={[
            styles.avatarButton,
            { backgroundColor: theme.surfaceVariant, borderColor: theme.accent },
          ]}
          accessibilityLabel="User Profile"
        >
          <Text style={[styles.avatarInitial, { color: theme.accent }]}>
            {userInitial}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  taglineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  taglineText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '800',
  },
  signOutButton: {
    marginLeft: 2,
  },
});
