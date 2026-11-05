import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Shirt, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { Button } from '../../src/components/common/Button';
import { SPACING, RADIUS } from '../../src/constants/theme';

interface Slide {
  id: string;
  icon: (color: string) => React.ReactNode;
  badge: string;
  title: string;
  tagline: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: (color) => <Shirt size={54} color={color} />,
    badge: 'DIGITAL CLOSET',
    title: 'Your Wardrobe,\nReimagined.',
    tagline: 'Style-ta Dhoro, Nijer Moto Cholo',
    description:
      'Digitally organize your existing clothes with AI-assisted recognition. Filter by category, color, season, and laundry status.',
  },
  {
    id: '2',
    icon: (color) => <Sparkles size={54} color={color} />,
    badge: 'SMART STYLING',
    title: 'AI Stylist Using\nWhat You Own.',
    tagline: 'Style-ta Dhoro, Nijer Moto Cholo',
    description:
      'Generate perfect outfit combinations powered by Gemini. Real clothes from your wardrobe, tailored to today’s weather and your occasions.',
  },
  {
    id: '3',
    icon: (color) => <ShoppingBag size={54} color={color} />,
    badge: 'SUSTAINABLE FASHION',
    title: 'Rent, Shop &\nCommunity Buy.',
    tagline: 'Style-ta Dhoro, Nijer Moto Cholo',
    description:
      'Rent occasion-wear, discover curated fashion, and join time-limited neighborhood group orders with safe public pickup points.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme } = useThemeStore();
  const { completeOnboarding } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      flatListRef.current?.scrollToIndex({
        index: nextIdx,
        animated: true,
      });
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding();
    } catch (err) {
      console.log('Error completing onboarding:', err);
    }
    router.replace('/(auth)/login');
  };

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const onScrollToIndexFailed = (info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 100);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <Text style={[styles.brandName, { color: theme.textPrimary }]}>DHORA</Text>
          <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        </View>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleFinish} hitSlop={15}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.iconInner,
                  { backgroundColor: theme.accentLight },
                ]}
              >
                {item.icon(theme.accent)}
              </View>
            </View>

            <View
              style={[
                styles.badgeContainer,
                { backgroundColor: theme.surfaceVariant },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.accentDark }]}>
                {item.badge}
              </Text>
            </View>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {item.title}
            </Text>

            <Text style={[styles.tagline, { color: theme.accent }]}>
              "{item.tagline}"
            </Text>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    currentIndex === index ? theme.accent : theme.border,
                  width: currentIndex === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={
            currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'
          }
          variant="accent"
          size="lg"
          onPress={handleNext}
          icon={
            currentIndex === slides.length - 1 ? undefined : (
              <ArrowRight size={18} color="#FFFFFF" />
            )
          }
          iconPosition="right"
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    width: '100%',
  },
});
