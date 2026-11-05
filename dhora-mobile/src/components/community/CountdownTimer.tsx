import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertCircle } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { darkTheme, lightTheme } from '../../constants/theme';

interface CountdownTimerProps {
  closingAt: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  closingAt,
  onExpire,
  compact = false,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(closingAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [closingAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <View
        style={[
          styles.badgeExpired,
          { backgroundColor: isDarkMode ? '#2D1B1B' : '#FEE2E2' },
        ]}
      >
        <AlertCircle size={14} color="#EF4444" />
        <Text style={[styles.textExpired, { color: '#EF4444' }]}>
          Order Closed
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View
        style={[
          styles.badgeActiveCompact,
          { backgroundColor: isDarkMode ? '#332306' : '#FEF3C7' },
        ]}
      >
        <Clock size={12} color="#D97706" />
        <Text style={[styles.textActiveCompact, { color: '#B45309' }]}>
          {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
          {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#1E1E24' : '#FFFBEB',
          borderColor: isDarkMode ? '#382E1E' : '#FDE68A',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Clock size={16} color="#D97706" />
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#FCD34D' : '#92400E' },
          ]}
        >
          Group Order Closes In:
        </Text>
      </View>

      <View style={styles.digitsRow}>
        <View style={[styles.box, { backgroundColor: isDarkMode ? '#282832' : '#FDF4DC' }]}>
          <Text style={[styles.digits, { color: theme.textPrimary }]}>{pad(timeLeft.hours)}</Text>
          <Text style={[styles.label, { color: theme.textSecondary }]}>HRS</Text>
        </View>
        <Text style={[styles.colon, { color: theme.textSecondary }]}>:</Text>
        <View style={[styles.box, { backgroundColor: isDarkMode ? '#282832' : '#FDF4DC' }]}>
          <Text style={[styles.digits, { color: theme.textPrimary }]}>{pad(timeLeft.minutes)}</Text>
          <Text style={[styles.label, { color: theme.textSecondary }]}>MIN</Text>
        </View>
        <Text style={[styles.colon, { color: theme.textSecondary }]}>:</Text>
        <View style={[styles.box, { backgroundColor: isDarkMode ? '#282832' : '#FDF4DC' }]}>
          <Text style={[styles.digits, { color: '#D97706' }]}>{pad(timeLeft.seconds)}</Text>
          <Text style={[styles.label, { color: theme.textSecondary }]}>SEC</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  textExpired: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeActiveCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  textActiveCompact: {
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  digitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  box: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 46,
  },
  digits: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  colon: {
    fontSize: 18,
    fontWeight: '800',
  },
});
