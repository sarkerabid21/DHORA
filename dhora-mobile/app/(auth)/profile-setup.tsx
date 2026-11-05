import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Check, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { Button } from '../../src/components/common/Button';
import { SPACING, RADIUS } from '../../src/constants/theme';

const CATEGORIES = [
  'Tops',
  'T-shirts',
  'Shirts',
  'Pants',
  'Jeans',
  'Panjabi',
  'Saree',
  'Dresses',
  'Jackets',
  'Shoes',
  'Accessories',
];

const COLORS = [
  'Black',
  'White',
  'Navy Blue',
  'Beige / Tan',
  'Olive Green',
  'Burgundy',
  'Pastel Blue',
  'Earthy Brown',
  'Charcoal Grey',
];

const AESTHETICS = [
  'Minimalist',
  'Smart Casual',
  'Streetwear',
  'Traditional Bengali',
  'Classic Vintage',
  'Athleisure',
];

const OCCASIONS = [
  'University',
  'Office / Work',
  'Daily Casual',
  'Party & Events',
  'Traditional / Festive',
  'Weekend Outing',
];

const LOCATIONS = [
  'Dhaka (Dhanmondi)',
  'Dhaka (Gulshan/Banani)',
  'Dhaka (Uttara)',
  'Dhaka (Mirpur)',
  'Dhaka (DU Campus)',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { updateStylePreferences, isLoading } = useAuthStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Tops',
    'Pants',
    'T-shirts',
  ]);
  const [selectedColors, setSelectedColors] = useState<string[]>([
    'Black',
    'White',
    'Navy Blue',
  ]);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([
    'Smart Casual',
    'Minimalist',
  ]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([
    'University',
    'Daily Casual',
  ]);
  const [selectedLocation, setSelectedLocation] = useState<string>('Dhaka (Dhanmondi)');

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    await updateStylePreferences({
      preferredCategories: selectedCategories,
      preferredColors: selectedColors,
      styleAesthetic: selectedAesthetics,
      occasions: selectedOccasions,
      fitPreference: 'REGULAR',
      locationArea: selectedLocation,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.sparkleBadge,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Sparkles size={22} color={theme.accent} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Style-ta Customize Koro
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select your personal fashion preferences so DHORA's AI can tailor outfit suggestions to you.
          </Text>
        </View>

        {/* Section 1: Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            1. What clothes do you wear most?
          </Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Colors */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            2. Favorite color palettes
          </Text>
          <View style={styles.chipGrid}>
            {COLORS.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => toggleItem(selectedColors, setSelectedColors, color)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.textPrimary : theme.surface,
                      borderColor: isSelected ? theme.textPrimary : theme.border,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Aesthetics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            3. Style Aesthetic
          </Text>
          <View style={styles.chipGrid}>
            {AESTHETICS.map((aes) => {
              const isSelected = selectedAesthetics.includes(aes);
              return (
                <TouchableOpacity
                  key={aes}
                  onPress={() => toggleItem(selectedAesthetics, setSelectedAesthetics, aes)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {aes}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Occasions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            4. Common Occasions
          </Text>
          <View style={styles.chipGrid}>
            {OCCASIONS.map((occ) => {
              const isSelected = selectedOccasions.includes(occ);
              return (
                <TouchableOpacity
                  key={occ}
                  onPress={() => toggleItem(selectedOccasions, setSelectedOccasions, occ)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.textPrimary : theme.surface,
                      borderColor: isSelected ? theme.textPrimary : theme.border,
                    },
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {occ}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 5: Area / Location */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm }}>
            <MapPin size={16} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 0 }]}>
              5. Local Area for Recommendations & Community Buy
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  onPress={() => setSelectedLocation(loc)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? theme.accentLight : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? theme.accentDark : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit */}
        <Button
          title="Save & Enter DHORA"
          variant="accent"
          size="lg"
          loading={isLoading}
          onPress={handleFinish}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sparkleBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
});
