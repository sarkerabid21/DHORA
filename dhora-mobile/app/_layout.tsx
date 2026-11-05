import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { useThemeStore } from '../src/stores/themeStore';

export default function RootLayout() {
  const { isDarkMode, theme } = useThemeStore();
  const {
    isAuthenticated,
    isOnboardingCompleted,
    isLoading,
    loadInitialState,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadInitialState();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isOnboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isOnboardingCompleted && !isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, isOnboardingCompleted, segments]);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.background,
              zIndex: 9999,
            },
          ]}
        >
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      )}
    </SafeAreaProvider>
  );
}
