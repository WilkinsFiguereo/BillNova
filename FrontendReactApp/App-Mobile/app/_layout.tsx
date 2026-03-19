import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
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
      </AuthProvider>

      {/* 🔥 Oculta barra superior */}
      <StatusBar hidden />
    </ThemeProvider>
  );
}