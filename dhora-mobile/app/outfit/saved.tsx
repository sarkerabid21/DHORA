import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Inbox } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useStylistStore } from '../../src/stores/stylistStore';
import { OutfitCard } from '../../src/components/stylist/OutfitCard';
import { OutfitPreviewModal } from '../../src/components/stylist/OutfitPreviewModal';
import { EmptyState } from '../../src/components/common/EmptyState';
import { GroundedOutfit } from '../../src/types/stylist';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function SavedLooksScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { savedLooks } = useStylistStore();

  const [previewOutfit, setPreviewOutfit] = useState<GroundedOutfit | null>(null);

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
            Saved Looks
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {savedLooks.length} curated combinations from your closet
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {savedLooks.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={32} color={theme.accent} />}
            title="No Saved Looks Yet"
            description="Ask DHORA AI Stylist to recommend combinations or save your daily outfit."
            actionTitle="Talk to AI Stylist"
            onAction={() => router.push('/(tabs)/stylist')}
          />
        ) : (
          savedLooks.map((look, idx) => (
            <OutfitCard
              key={look._id || idx}
              outfit={look}
              onPreview={(outfit) => setPreviewOutfit(outfit)}
            />
          ))
        )}
      </ScrollView>

      {/* Outfit Preview Modal */}
      <OutfitPreviewModal
        visible={!!previewOutfit}
        outfit={previewOutfit}
        onClose={() => setPreviewOutfit(null)}
      />
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
});
