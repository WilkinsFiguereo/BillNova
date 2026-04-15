import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CartProvider } from '../src/features/cart/context/CartContext';
import { AuthProvider } from '../src/core/providers/AuthProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // 🔥 Modo inmersivo Android
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Grupo de autenticación */}
            <Stack.Screen name="(auth)" />

            {/* Tabs principales */}
            <Stack.Screen name="(tabs)" />

            {/* Modal de registro */}
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

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
