import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { RADIUS, SPACING } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  bordered = true,
}) => {
  const { theme } = useThemeStore();

  const containerStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderColor: bordered ? theme.border : 'transparent',
    borderWidth: bordered ? 1 : 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};
