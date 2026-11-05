import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Home, Shirt, Sparkles, Calendar, ShoppingBag } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { RADIUS, SPACING } from '../../src/constants/theme';

export default function TabLayout() {
  const { theme, isDarkMode } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Closet',
          tabBarIcon: ({ color, size, focused }) => (
            <Shirt size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      {/* Central Distinct AI Stylist Item */}
      <Tabs.Screen
        name="stylist"
        options={{
          title: 'AI Stylist',
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={props.onPress}
              style={styles.stylistButtonContainer}
            >
              <View
                style={[
                  styles.stylistButton,
                  {
                    backgroundColor: theme.accent,
                    shadowColor: theme.accent,
                  },
                ]}
              >
                <Sparkles size={24} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <Text
                style={[
                  styles.stylistLabel,
                  {
                    color: props.accessibilityState?.selected
                      ? theme.accent
                      : theme.textTertiary,
                  },
                ]}
              >
                AI Stylist
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size, focused }) => (
            <Calendar size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size, focused }) => (
            <ShoppingBag size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  stylistButtonContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  stylistButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  stylistLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});
