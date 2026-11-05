import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock, AlertCircle } from 'lucide-react-native';
import { BookingStatus } from '../../types/marketplace';
import { useThemeStore } from '../../stores/themeStore';
import { RADIUS, SPACING } from '../../constants/theme';

export interface BookingStepperProps {
  status: BookingStatus;
}

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'PENDING', label: 'Requested' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Dispatched' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'RETURN_REQUESTED', label: 'Return' },
  { key: 'UNDER_INSPECTION', label: 'Inspected' },
  { key: 'COMPLETED', label: 'Completed' },
];

export const BookingStepper: React.FC<BookingStepperProps> = ({ status }) => {
  const { theme } = useThemeStore();

  if (status === 'CANCELLED') {
    return (
      <View style={styles.cancelledContainer}>
        <AlertCircle size={16} color="#DC2626" />
        <Text style={styles.cancelledText}>Rental Booking Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;

          let circleBg = theme.surfaceVariant;
          let textColor = theme.textTertiary;

          if (isDone) {
            circleBg = '#059669';
            textColor = '#059669';
          } else if (isCurrent) {
            circleBg = theme.accent;
            textColor = theme.accent;
          }

          return (
            <React.Fragment key={step.key}>
              {/* Connector line between steps */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        index <= activeStep ? theme.accent : theme.border,
                    },
                  ]}
                />
              )}

              <View style={styles.stepColumn}>
                <View style={[styles.stepCircle, { backgroundColor: circleBg }]}>
                  {isDone ? (
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNum,
                        { color: isCurrent ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepLabel,
                    {
                      color: textColor,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: -14,
  },
  stepColumn: {
    alignItems: 'center',
    width: 44,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNum: {
    fontSize: 9,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  cancelledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
  },
  cancelledText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
});
