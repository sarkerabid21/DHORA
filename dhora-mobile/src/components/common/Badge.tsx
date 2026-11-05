import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { RADIUS, SPACING } from '../../constants/theme';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  style,
}) => {
  const { theme } = useThemeStore();

  let bg = theme.surfaceVariant;
  let textColor = theme.textSecondary;

  switch (variant) {
    case 'accent':
      bg = theme.accentLight;
      textColor = theme.accentDark;
      break;
    case 'success':
      bg = '#ECFDF5';
      textColor = '#059669';
      break;
    case 'warning':
      bg = '#FFFBEB';
      textColor = '#D97706';
      break;
    case 'error':
      bg = '#FEF2F2';
      textColor = '#DC2626';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
