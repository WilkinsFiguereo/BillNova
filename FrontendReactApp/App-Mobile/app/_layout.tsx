import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform } from 'react-native';
import { useCallback, useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../src/core/providers/AuthProvider';
import { CartProvider } from '../src/features/cart/context/CartContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const applyImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    await Promise.allSettled([
      NavigationBar.setVisibilityAsync('hidden'),
    ]);
  }, []);

  useEffect(() => {
    void applyImmersiveMode();

    const timers = [
      setTimeout(() => void applyImmersiveMode(), 150),
      setTimeout(() => void applyImmersiveMode(), 600),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [applyImmersiveMode, pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;

      void applyImmersiveMode();
      setTimeout(() => void applyImmersiveMode(), 250);
    });

    return () => {
      subscription.remove();
    };
  }, [applyImmersiveMode]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Registro',
                headerShown: true,
              }}
            />
          </Stack>
        </CartProvider>
      </AuthProvider>

      <StatusBar hidden style="light" translucent />
    </ThemeProvider>
  );
}
