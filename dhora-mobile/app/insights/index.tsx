import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  PieChart,
  Repeat,
  CheckCircle2,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useInsightsStore } from '../../src/stores/insightsStore';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function InsightsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { data, fetchInsights, isLoading } = useInsightsStore();

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}
        >
          <ChevronLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Wardrobe Intelligence
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Real cost-per-wear stats, closet metrics & AI gap analysis
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {data.totalItems === 0 && (
          <Card style={{ padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md }}>
            <PieChart size={36} color={theme.accent} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' }}>
              Not Enough Data Yet
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>
              Digitize clothes in your Wardrobe to unlock real cost-per-wear metrics, closet rotation, and AI gap recommendations.
            </Text>
          </Card>
        )}

        {/* Top 4 Summary Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {data.totalItems}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Items
            </Text>
          </Card>

          <Card style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.accent }]}>
              ৳{data.totalClosetValue.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Closet Value
            </Text>
          </Card>

          <Card style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#059669' }]}>
              ৳{data.avgCostPerWear}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg Cost / Wear
            </Text>
          </Card>

          <Card style={styles.statBox}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {data.totalWornCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Times Worn
            </Text>
          </Card>
        </View>

        {/* Repetition Alert if any */}
        {data.repetitionAlert && (
          <View style={styles.repetitionAlert}>
            <Repeat size={18} color="#D97706" />
            <Text style={styles.repetitionText}>{data.repetitionAlert}</Text>
          </View>
        )}

        {/* AI Wardrobe Gap Analysis Report */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={18} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Wardrobe Gap Analysis
            </Text>
          </View>
          <Badge label="AI Evaluated" variant="accent" />
        </View>

        <Card style={styles.gapCard}>
          <Text style={[styles.gapDesc, { color: theme.textSecondary }]}>
            Gemini analyzed your current closet ratios to highlight missing categories that will multiply your overall styling versatility.
          </Text>

          {data.gapRecommendations.map((gap, idx) => (
            <View
              key={idx}
              style={[
                styles.gapItem,
                { backgroundColor: theme.surfaceVariant },
              ]}
            >
              <View style={styles.gapItemHeader}>
                <Badge label={`Missing: ${gap.category}`} variant="warning" />
              </View>
              <Text style={[styles.gapReason, { color: theme.textPrimary }]}>
                {gap.reason}
              </Text>
            </View>
          ))}
        </Card>

        {/* Category Distribution Breakdown */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <PieChart size={18} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Closet Composition
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          {Object.entries(data.categoryCounts).map(([cat, count]) => {
            const percentage = Math.round((count / Math.max(data.totalItems, 1)) * 100);
            return (
              <View key={cat} style={styles.distributionRow}>
                <View style={styles.distributionLabels}>
                  <Text style={[styles.distCat, { color: theme.textPrimary }]}>
                    {cat}
                  </Text>
                  <Text style={[styles.distCount, { color: theme.textSecondary }]}>
                    {count} items ({percentage}%)
                  </Text>
                </View>
                <View
                  style={[
                    styles.barBg,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: theme.accent,
                        width: `${percentage}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Color Palette Distribution */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Dominant Color Palette
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.colorPillsContainer}>
            {Object.entries(data.colorCounts).map(([color, count]) => (
              <View
                key={color}
                style={[
                  styles.colorPill,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor:
                        color.toLowerCase().includes('black')
                          ? '#000000'
                          : color.toLowerCase().includes('white')
                          ? '#FFFFFF'
                          : color.toLowerCase().includes('indigo') ||
                            color.toLowerCase().includes('blue')
                          ? '#1E3A8A'
                          : color.toLowerCase().includes('tan')
                          ? '#D97706'
                          : color.toLowerCase().includes('olive')
                          ? '#65A30D'
                          : '#71717A',
                    },
                  ]}
                />
                <Text style={[styles.colorName, { color: theme.textPrimary }]}>
                  {color} ({count})
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    width: '48.5%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  repetitionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  repetitionText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  gapCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  gapDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  gapItem: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  gapItemHeader: {
    marginBottom: 4,
  },
  gapReason: {
    fontSize: 12,
    lineHeight: 17,
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  distributionRow: {
    marginBottom: SPACING.sm + 2,
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  distCat: {
    fontSize: 12,
    fontWeight: '600',
  },
  distCount: {
    fontSize: 11,
  },
  barBg: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3.5,
  },
  colorPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#D4D4D8',
  },
  colorName: {
    fontSize: 11,
    fontWeight: '600',
  },
});
