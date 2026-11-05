import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  CloudSun,
  Droplets,
  Wind,
  Sparkles,
  Bookmark,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Shirt,
  Calendar,
  Compass,
  ShoppingBag,
  Repeat,
  Users,
  Search,
  Eye,
  PieChart,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  Award,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Quote,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { useStylistStore } from '../../src/stores/stylistStore';
import { useWardrobeStore } from '../../src/stores/wardrobeStore';
import { OutfitPreviewModal } from '../../src/components/stylist/OutfitPreviewModal';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { GroundedOutfit } from '../../src/types/stylist';
import { TopNavbar } from '../../src/components/common/TopNavbar';
import { SPACING, RADIUS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

// Curated Aesthetic Moods & Trends for Dhaka
const TRENDING_AESTHETICS = [
  {
    id: 'old_money',
    title: 'Old Money Dhaka',
    bengaliSubtitle: 'অভিজাত ও মিনিমালিস্ট ফরমাল লুক',
    description: 'Linen Button-Down + Espresso Chinos + Minimal Loafers',
    matchPercentage: 94,
    tags: ['Linen', 'Minimal', 'Neutral'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
    palette: ['#1E293B', '#5A3825', '#F5F5F0'],
    vibePrompt: 'Style an Old Money Dhaka aesthetic with minimal neutral tones and crisp tailoring.',
  },
  {
    id: 'campus_minimal',
    title: 'Minimalist Campus',
    bengaliSubtitle: 'রিল্যাক্সড দৈনন্দিন ক্যাজুয়াল সাজ',
    description: 'Oversized Heavy Tee + Relaxed Chinos + Clean White Sneakers',
    matchPercentage: 88,
    tags: ['Casual', 'Breathable', 'Street'],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    palette: ['#0F172A', '#D4D4D8', '#FFFFFF'],
    vibePrompt: 'Style a comfortable, breathable campus look with casual tees and relaxed bottoms.',
  },
  {
    id: 'shaadi_guest',
    title: 'Dhakai Shaadi Guest',
    bengaliSubtitle: 'উৎসব ও ওয়েডিং অনুষ্ঠানের সাজ',
    description: 'Heritage Silk Panjabi / Kurti + Embroidered Waistcoat',
    matchPercentage: 92,
    tags: ['Traditional', 'Festive', 'Silk'],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    palette: ['#7F1D1D', '#CA8A04', '#FEF3C7'],
    vibePrompt: 'Style a festive Bangladeshi wedding guest look with rich traditional colors.',
  },
  {
    id: 'monochrome_exec',
    title: 'Monochrome Executive',
    bengaliSubtitle: 'স্মার্ট মিটিং ও অফিস ওয়্যার',
    description: 'Mandarin Collar Dark Shirt + Charcoal Tailored Pants',
    matchPercentage: 95,
    tags: ['Formal', 'Sharp', 'Slim'],
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    palette: ['#18181B', '#3F3F46', '#71717A'],
    vibePrompt: 'Style a monochrome modern office look with black and charcoal tones.',
  },
];

// Live Neighborhood Community Buys in Dhaka
const FEATURED_GROUP_DROPS = [
  {
    id: 'grp_1',
    productName: 'Aarong Handloom Cotton Panjabi',
    area: 'Dhaka (Dhanmondi)',
    price: 1850,
    deliverySaved: 140,
    participants: 4,
    maxParticipants: 6,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    timeLeft: '1h 45m left',
  },
  {
    id: 'grp_2',
    productName: 'Sailor Classic Oxford Shirt',
    area: 'Dhaka (Gulshan)',
    price: 1950,
    deliverySaved: 120,
    participants: 3,
    maxParticipants: 5,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    timeLeft: '3h 10m left',
  },
];

// Verified Occasionwear Rentals for Party & Wedding Season
const FEATURED_OCCASION_RENTALS = [
  {
    id: 'rent_1',
    title: 'Handcrafted Jamdani Silk Saree',
    condition: 'LIKE NEW',
    dailyPrice: 650,
    location: 'Dhanmondi, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    badge: 'Verified Clean ✨',
  },
  {
    id: 'rent_2',
    title: 'Raymond Italian Wool Tailored Tuxedo',
    condition: 'EXCELLENT',
    dailyPrice: 950,
    location: 'Gulshan, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    badge: 'Dry Cleaned ✨',
  },
  {
    id: 'rent_3',
    title: 'Royal Crimson Zari Heritage Sherwani',
    condition: 'BRAND NEW',
    dailyPrice: 1200,
    location: 'Banani, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    badge: 'Wedding Premium ✨',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const {
    todayOutfit,
    weather,
    savedLooks,
    saveOutfit,
    unsaveOutfit,
    generateAnotherOutfit,
    fetchTodayWeatherOutfit,
    sendMessage,
  } = useStylistStore();
  const { items, fetchItems } = useWardrobeStore();

  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOutfit, setPreviewOutfit] = useState<GroundedOutfit | null>(null);

  useEffect(() => {
    fetchItems();
    fetchTodayWeatherOutfit();
  }, []);

  const isSaved = todayOutfit
    ? savedLooks.some(
        (l) => l._id === todayOutfit._id || l.title === todayOutfit.title
      )
    : false;

  const handleToggleSave = () => {
    if (!todayOutfit) return;
    if (isSaved) {
      if (todayOutfit._id) unsaveOutfit(todayOutfit._id);
    } else {
      saveOutfit(todayOutfit);
    }
  };

  const handleGenerateAnother = async () => {
    setIsGenerating(true);
    await generateAnotherOutfit();
    setIsGenerating(false);
  };

  const handleSelectAesthetic = (aesthetic: typeof TRENDING_AESTHETICS[0]) => {
    sendMessage(aesthetic.vibePrompt);
    router.push('/(tabs)/stylist' as any);
  };

  const quickActions = [
    {
      title: 'Add Clothes',
      icon: <PlusCircle size={22} color={theme.accent} />,
      route: '/(tabs)/wardrobe?action=upload',
    },
    {
      title: 'AI Stylist',
      icon: <Sparkles size={22} color={theme.accent} />,
      route: '/(tabs)/stylist',
    },
    {
      title: 'Plan Outfit',
      icon: <Calendar size={22} color={theme.accent} />,
      route: '/(tabs)/planner',
    },
    {
      title: 'Before Buy',
      icon: <Search size={22} color={theme.accent} />,
      route: '/(tabs)/discover?tab=before-buy',
    },
    {
      title: 'Rent Wear',
      icon: <Repeat size={22} color={theme.accent} />,
      route: '/(tabs)/discover?tab=rent',
    },
    {
      title: 'Group Buy',
      icon: <Users size={22} color={theme.accent} />,
      route: '/(tabs)/discover?tab=community',
    },
    {
      title: 'Trip Stylist',
      icon: <Compass size={22} color={theme.accent} />,
      route: '/trip',
    },
    {
      title: 'Closet Stats',
      icon: <PieChart size={22} color={theme.accent} />,
      route: '/insights',
    },
  ];

  const stories = [
    {
      id: 'outfit_today',
      title: "Today's Fit",
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200',
      action: () => (todayOutfit ? setPreviewOutfit(todayOutfit) : router.push('/(tabs)/stylist' as any)),
      badge: 'FIT',
    },
    {
      id: 'weather',
      title: 'Dhaka Fit',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200',
      action: () => router.push('/(tabs)/stylist' as any),
      badge: `${weather.temperature || 28}°C`,
    },
    {
      id: 'sajek',
      title: 'Trip Stylist',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      action: () => router.push('/trip' as any),
      badge: 'Tour',
    },
    {
      id: 'rent',
      title: 'Wedding Rent',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200',
      action: () => router.push('/(tabs)/discover?tab=rent' as any),
      badge: 'Rent',
    },
    {
      id: 'group_buy',
      title: 'Group Drops',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200',
      action: () => router.push('/(tabs)/discover?tab=community' as any),
      badge: 'Save ৳',
    },
    {
      id: 'before_buy',
      title: 'Before Buy',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
      action: () => router.push('/(tabs)/discover?tab=before-buy' as any),
      badge: 'AI',
    },
    {
      id: 'closet_health',
      title: 'Closet Score',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200',
      action: () => router.push('/insights' as any),
      badge: '88%',
    },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Universal DHORA Top Navigation Bar */}
      <TopNavbar showWeather={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* SECTION 1: Daily Style Highlights Reel (Instagram / Acloset Style Stories) */}
        <View style={styles.storiesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}
          >
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                onPress={story.action}
                style={styles.storyItem}
                activeOpacity={0.8}
              >
                <View style={[styles.storyRing, { borderColor: theme.accent }]}>
                  <Image source={{ uri: story.image }} style={styles.storyImg} />
                  <View style={[styles.storyBadge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.storyBadgeText}>{story.badge}</Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={[styles.storyTitle, { color: theme.textPrimary }]}>
                  {story.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SECTION 2: Elevated Editorial Greeting & Daily Context */}
        <View style={styles.editorialGreetingRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.dateBadgeRow}>
              <Calendar size={11} color={theme.accent} />
              <Text style={[styles.dateText, { color: theme.accent }]}>
                {currentDateFormatted} • DHAKA
              </Text>
            </View>
            <Text style={[styles.greetingHeadline, { color: theme.textPrimary }]}>
              Assalamu Alaikum, {user?.fullName?.split(' ')[0] || 'Fashion Explorer'} 👋
            </Text>
            <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
              Your AI wardrobe is synchronized and ready for today.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/insights')}
            style={[styles.healthPill, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
            <View>
              <Text style={[styles.healthScore, { color: theme.textPrimary }]}>
                {Math.min(65 + items.length * 5, 96)}%
              </Text>
              <Text style={[styles.healthLabel, { color: theme.textSecondary }]}>
                Closet Ready
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Ambient Weather & Climate Capsule */}
        <Card style={styles.weatherCard}>
          <View style={styles.weatherRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.weatherIconCircle, { backgroundColor: theme.accent + '20' }]}>
                  <CloudSun size={26} color={theme.accent} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={[styles.tempText, { color: theme.textPrimary }]}>
                      {weather.temperature}°C
                    </Text>
                    <Text style={[styles.weatherCondition, { color: theme.textSecondary }]}>
                      {weather.condition}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <MapPin size={11} color={theme.textTertiary} />
                    <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                      {weather.city || user?.locationArea || 'Dhanmondi, Dhaka'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.weatherPillsCol}>
              <View style={[styles.weatherMicroPill, { backgroundColor: theme.surfaceVariant }]}>
                <Droplets size={12} color={theme.accent} />
                <Text style={[styles.weatherMicroText, { color: theme.textPrimary }]}>
                  {weather.humidity}% Humid
                </Text>
              </View>
              <View style={[styles.weatherMicroPill, { backgroundColor: theme.surfaceVariant }]}>
                <Wind size={12} color={theme.accent} />
                <Text style={[styles.weatherMicroText, { color: theme.textPrimary }]}>
                  Rain: {weather.rainProbability}%
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.weatherTipBox, { backgroundColor: theme.surfaceVariant }]}>
            <Sparkles size={14} color={theme.accent} style={{ marginTop: 2 }} />
            <Text style={[styles.weatherTipText, { color: theme.textPrimary }]}>
              {weather.recommendationHint || 'ঢাকার আজকের রোদ ও হালকা বাতাসে আরামদায়ক সুতি শার্ট ও চিনোস পরার সেরা দিন!'}
            </Text>
          </View>
        </Card>

        {/* SECTION 4: Magazine Editorial "AI Outfit of the Day" */}
        <View style={styles.sectionHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                AI Outfit of the Day
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Grounded exclusively in your digitized closet items
            </Text>
          </View>
          <Badge label="Curated Look" variant="success" />
        </View>

        {todayOutfit ? (
          <Card style={styles.outfitCard}>
            <View style={styles.outfitMeta}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.outfitTitle, { color: theme.textPrimary }]}>
                  {todayOutfit.title}
                </Text>
                <Text style={[styles.outfitOccasion, { color: theme.accent }]}>
                  {todayOutfit.occasion}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleSave}
                style={[
                  styles.saveButton,
                  { backgroundColor: isSaved ? theme.accentLight : theme.surfaceVariant },
                ]}
              >
                <Bookmark
                  size={18}
                  color={isSaved ? theme.accent : theme.textSecondary}
                  fill={isSaved ? theme.accent : 'none'}
                />
              </TouchableOpacity>
            </View>

            {/* Clothing Items Grid */}
            <View style={styles.clothingGrid}>
              {todayOutfit.items.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.clothingCard, { backgroundColor: theme.surfaceVariant }]}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.clothingImage}
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1} style={[styles.clothingName, { color: theme.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.clothingCat, { color: theme.textSecondary }]}>
                    {item.role}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rationale Toggle */}
            {isWhyModalOpen && (
              <View style={[styles.whyContainer, { backgroundColor: theme.surfaceVariant, borderLeftColor: theme.accent, borderLeftWidth: 3 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Sparkles size={14} color={theme.accent} />
                  <Text style={[styles.whyTitle, { color: theme.textPrimary }]}>
                    Why Gemini Recommended This Look:
                  </Text>
                </View>
                <Text style={[styles.whyText, { color: theme.textSecondary }]}>
                  {todayOutfit.rationale}
                </Text>
              </View>
            )}

            {/* Action Row */}
            <View style={styles.outfitActionRow}>
              <TouchableOpacity
                onPress={() => setIsWhyModalOpen(!isWhyModalOpen)}
                style={[styles.smallActionBtn, { borderColor: theme.border }]}
              >
                <HelpCircle size={14} color={theme.textSecondary} />
                <Text style={[styles.smallActionText, { color: theme.textSecondary }]}>
                  {isWhyModalOpen ? 'Hide Reasoning' : 'Why This Outfit?'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreviewOutfit(todayOutfit)}
                style={[styles.smallActionBtn, { borderColor: theme.accent, backgroundColor: theme.accent + '15' }]}
              >
                <Eye size={14} color={theme.accent} />
                <Text style={[styles.smallActionText, { color: theme.accent }]}>
                  Try-On Preview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateAnother}
                disabled={isGenerating}
                style={[styles.smallActionBtn, { borderColor: theme.border }]}
              >
                <RefreshCw size={14} color={theme.accent} />
                <Text style={[styles.smallActionText, { color: theme.accent }]}>
                  {isGenerating ? 'Styling...' : 'Regenerate'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card style={{ padding: SPACING.lg, alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.accentLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.sm,
              }}
            >
              <Shirt size={24} color={theme.accent} />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.textPrimary,
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              Your Digital Closet is Ready to Build
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                marginBottom: SPACING.md,
                textAlign: 'center',
                lineHeight: 18,
                maxWidth: 290,
              }}
            >
              DHORA AI needs at least 2 clothes in your wardrobe to generate personalized, grounded daily looks.
            </Text>
            <Button
              title="📸 Digitize My Clothes"
              variant="accent"
              size="md"
              onPress={() => router.push('/(tabs)/wardrobe?action=upload' as any)}
            />
          </Card>
        )}

        {/* SECTION 5: Symmetrical Quick Actions Grid (4x2) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.route as any)}
              style={[
                styles.quickCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickIconCircle,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                {action.icon}
              </View>
              <Text numberOfLines={2} style={[styles.quickTitle, { color: theme.textPrimary }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 6: Trending Dhaka Aesthetics & Signature Lookbook */}
        <View style={styles.sectionHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Flame size={18} color="#D97706" />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Curated Aesthetics & Moods
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              ঢাকার ট্রেন্ডিং স্টাইল ভাইব • ১-ট্যাপে AI দিয়ে সাজান
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/stylist')}>
            <Text style={[styles.viewAllText, { color: theme.accent }]}>Explore All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardsScroll}
        >
          {TRENDING_AESTHETICS.map((aesthetic) => (
            <TouchableOpacity
              key={aesthetic.id}
              style={[styles.aestheticCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => handleSelectAesthetic(aesthetic)}
              activeOpacity={0.88}
            >
              <View style={styles.aestheticImgBox}>
                <Image source={{ uri: aesthetic.image }} style={styles.aestheticImg} />
                <View style={styles.aestheticMatchBadge}>
                  <Text style={styles.aestheticMatchText}>{aesthetic.matchPercentage}% Closet Match</Text>
                </View>
              </View>
              <View style={styles.aestheticContent}>
                <Text style={[styles.aestheticTitle, { color: theme.textPrimary }]}>
                  {aesthetic.title}
                </Text>
                <Text style={[styles.aestheticBengali, { color: theme.accent }]}>
                  {aesthetic.bengaliSubtitle}
                </Text>
                <Text numberOfLines={2} style={[styles.aestheticDesc, { color: theme.textSecondary }]}>
                  {aesthetic.description}
                </Text>
                
                {/* Palette Dots */}
                <View style={styles.paletteDotsRow}>
                  {aesthetic.palette.map((c, i) => (
                    <View key={i} style={[styles.paletteDot, { backgroundColor: c }]} />
                  ))}
                  <View style={{ flex: 1 }} />
                  <View style={styles.styleBtnPill}>
                    <Text style={styles.styleBtnText}>Style Vibe ✨</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION 7: Active Neighborhood Group Drops (Community Buy) */}
        <View style={styles.sectionHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Live Neighborhood Group Drops
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Dhanmondi, Gulshan ও ক্যাম্পাসে ডেলিভারি ফি শেয়ার করুন
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover?tab=community')}>
            <Text style={[styles.viewAllText, { color: theme.accent }]}>View Drops →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupBuysContainer}>
          {FEATURED_GROUP_DROPS.map((drop) => (
            <TouchableOpacity
              key={drop.id}
              style={[styles.groupDropCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/(tabs)/discover?tab=community')}
              activeOpacity={0.85}
            >
              <Image source={{ uri: drop.imageUrl }} style={styles.groupDropImg} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text numberOfLines={1} style={[styles.groupDropName, { color: theme.textPrimary }]}>
                    {drop.productName}
                  </Text>
                  <Text style={[styles.groupDropPrice, { color: theme.accent }]}>
                    ৳{drop.price}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color={theme.textTertiary} />
                  <Text style={[styles.groupDropArea, { color: theme.textSecondary }]}>
                    {drop.area}
                  </Text>
                </View>
                <View style={styles.dropSavingRow}>
                  <View style={styles.dropSavingBadge}>
                    <Text style={styles.dropSavingText}>Save ৳{drop.deliverySaved} delivery</Text>
                  </View>
                  <View style={styles.dropTimeBadge}>
                    <Clock size={10} color="#D97706" />
                    <Text style={styles.dropTimeText}>{drop.timeLeft}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION 8: Curated Occasionwear Rentals (Wedding & Party Season) */}
        <View style={styles.sectionHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Repeat size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Occasionwear & Wedding Rentals
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              বিয়ে ও পার্টির পোশাক ৯০% কম খরচে ড্রাই-ক্লিন্ড ভাড়া নিন
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover?tab=rent')}>
            <Text style={[styles.viewAllText, { color: theme.accent }]}>All Rentals →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardsScroll}
        >
          {FEATURED_OCCASION_RENTALS.map((rental) => (
            <TouchableOpacity
              key={rental.id}
              style={[styles.rentalHighlightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/(tabs)/discover?tab=rent')}
              activeOpacity={0.88}
            >
              <View style={styles.rentalImgBox}>
                <Image source={{ uri: rental.imageUrl }} style={styles.rentalImg} />
                <View style={styles.rentalCleanBadge}>
                  <Text style={styles.rentalCleanText}>{rental.badge}</Text>
                </View>
              </View>
              <View style={styles.rentalContent}>
                <Text numberOfLines={1} style={[styles.rentalTitle, { color: theme.textPrimary }]}>
                  {rental.title}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text style={[styles.rentalPrice, { color: theme.accent }]}>
                    ৳{rental.dailyPrice} <Text style={{ fontSize: 10, fontWeight: '500', color: theme.textSecondary }}>/ day</Text>
                  </Text>
                  <Text style={[styles.rentalArea, { color: theme.textTertiary }]}>
                    {rental.location.split(',')[0]}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION 9: Wardrobe Growth & Missions (Interactive Gamification) */}
        <Card style={styles.missionsCard}>
          <View style={styles.missionsHeader}>
            <View style={[styles.missionsIconBadge, { backgroundColor: theme.accent + '20' }]}>
              <Award size={20} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.missionsTitle, { color: theme.textPrimary }]}>
                Level 2: Capsule Wardrobe Curator 🌟
              </Text>
              <Text style={[styles.missionsSub, { color: theme.textSecondary }]}>
                {items.length} / 10 essentials digitized to unlock winter layering AI
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceVariant }]}>
            <View style={[styles.progressBarFill, { width: `${Math.min((items.length / 10) * 100, 100)}%`, backgroundColor: theme.accent }]} />
          </View>

          {/* Quests */}
          <View style={styles.questsList}>
            <View style={styles.questRow}>
              <CheckCircle2 size={15} color="#10B981" />
              <Text style={[styles.questText, { color: theme.textPrimary }]}>
                Digitized everyday wardrobe garments ({items.length} items)
              </Text>
            </View>
            <View style={styles.questRow}>
              <CheckCircle2 size={15} color="#10B981" />
              <Text style={[styles.questText, { color: theme.textPrimary }]}>
                Generated AI grounded outfit of the day
              </Text>
            </View>
            <TouchableOpacity
              style={styles.questRow}
              onPress={() => router.push('/(tabs)/discover?tab=before-buy')}
            >
              <View style={[styles.uncheckCircle, { borderColor: theme.border }]} />
              <Text style={[styles.questText, { color: theme.accent, fontWeight: '600' }]}>
                Test an item in "Before You Buy" to check duplicates →
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 10: DHORA Daily Style Wisdom */}
        <Card style={[styles.quoteCard, { backgroundColor: theme.surfaceVariant }]}>
          <View style={styles.quoteRow}>
            <Quote size={20} color={theme.accent} style={{ transform: [{ rotate: '180deg' }] }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.quoteText, { color: theme.textPrimary }]}>
                "Monochrome layering with contrasting textures (cotton under knit or structured linen) elevates a simple silhouette instantly."
              </Text>
              <Text style={[styles.quoteBengali, { color: theme.accent }]}>
                — একই রঙের ভিন্ন টেক্সচারের পোশাক (যেমন কটন শার্টের ওপর লিনেন জ্যাকেট) সাধারণ লুকেও প্রিমিয়াম আভিজাত্য এনে দেয়।
              </Text>
            </View>
          </View>
        </Card>

        {/* SECTION 11: Wardrobe Overview Stats */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Wardrobe Metrics & Overview
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wardrobe')}>
            <Text style={[styles.viewAllText, { color: theme.accent }]}>View Closet →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Shirt size={18} color={theme.accent} style={{ marginBottom: 4 }} />
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {items.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Clothing Items
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Sparkles size={18} color={theme.accent} style={{ marginBottom: 4 }} />
            <Text style={[styles.statNumber, { color: theme.accent }]}>
              {savedLooks.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Saved Looks
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <CheckCircle2 size={18} color="#10B981" style={{ marginBottom: 4 }} />
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
              {items.filter((i) => i.status === 'AVAILABLE').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Ready to Wear
            </Text>
          </Card>
        </View>

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
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl + 20,
  },
  storiesSection: {
    marginHorizontal: -SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  storiesScroll: {
    paddingHorizontal: SPACING.md,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  storyImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  storyBadge: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  storyBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  storyTitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  editorialGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.xs,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  greetingHeadline: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthScore: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
  healthLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weatherCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempText: {
    fontSize: 22,
    fontWeight: '800',
  },
  weatherCondition: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  weatherPillsCol: {
    gap: 6,
    alignItems: 'flex-end',
  },
  weatherMicroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  weatherMicroText: {
    fontSize: 10,
    fontWeight: '600',
  },
  weatherTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: SPACING.sm + 2,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  weatherTipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  outfitCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  outfitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  outfitTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  outfitOccasion: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clothingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  clothingCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: 6,
    alignItems: 'center',
  },
  clothingImage: {
    width: '100%',
    height: 74,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  clothingName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  clothingCat: {
    fontSize: 9,
    marginTop: 1,
  },
  whyContainer: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  whyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  whyText: {
    fontSize: 11,
    lineHeight: 16,
  },
  outfitActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  smallActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    width: '100%',
  },
  quickCard: {
    width: '23.5%',
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  horizontalCardsScroll: {
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  aestheticCard: {
    width: 230,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  aestheticImgBox: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  aestheticImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aestheticMatchBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  aestheticMatchText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  aestheticContent: {
    padding: SPACING.sm + 2,
    gap: 4,
  },
  aestheticTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  aestheticBengali: {
    fontSize: 11,
    fontWeight: '600',
  },
  aestheticDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  paletteDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  paletteDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  styleBtnPill: {
    backgroundColor: '#C28E58',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  styleBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  groupBuysContainer: {
    gap: SPACING.sm,
  },
  groupDropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  groupDropImg: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
  },
  groupDropName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  groupDropPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  groupDropArea: {
    fontSize: 11,
    fontWeight: '500',
  },
  dropSavingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dropSavingBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  dropSavingText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  dropTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  dropTimeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '600',
  },
  rentalHighlightCard: {
    width: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rentalImgBox: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  rentalImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rentalCleanBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  rentalCleanText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  rentalContent: {
    padding: SPACING.sm,
  },
  rentalTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  rentalPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  rentalArea: {
    fontSize: 10,
  },
  missionsCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  missionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  missionsIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionsTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  missionsSub: {
    fontSize: 11,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  questsList: {
    gap: 8,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questText: {
    fontSize: 11,
    flex: 1,
  },
  uncheckCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1.5,
  },
  quoteCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  quoteRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '600',
  },
  quoteBengali: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
