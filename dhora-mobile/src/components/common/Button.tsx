import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { RADIUS, SPACING } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { theme } = useThemeStore();

  const getContainerStyle = (): ViewStyle => {
    let bg = theme.textPrimary;
    let border = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        bg = theme.textPrimary;
        break;
      case 'accent':
        bg = theme.accent;
        break;
      case 'secondary':
        bg = theme.surfaceVariant;
        break;
      case 'outline':
        bg = 'transparent';
        border = theme.border;
        borderWidth = 1.5;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
    }

    const paddingVertical = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
    const paddingHorizontal = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;

    return {
      backgroundColor: bg,
      borderColor: border,
      borderWidth,
      paddingVertical,
      paddingHorizontal,
      borderRadius: RADIUS.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'accent':
        return '#FFFFFF';
      case 'secondary':
        return theme.textPrimary;
      case 'outline':
        return theme.textPrimary;
      case 'ghost':
        return theme.accent;
      default:
        return '#FFFFFF';
    }
  };

  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: SPACING.sm }}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: SPACING.sm }}>{icon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
