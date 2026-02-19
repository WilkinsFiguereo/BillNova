import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../features/auth/hooks/useAuth';
import { colors } from '../shared/theme/colors';

/**
 * AppNavigator acts as the root-level gate.
 *
 * When using Expo Router:
 *  - Replace the renderAuth/renderApp blocks with <Redirect href="/(auth)/login" />
 *    and <Redirect href="/(app)/dashboard" /> respectively.
 *
 * When using React Navigation:
 *  - Return <AuthStack /> or <AppStack /> based on isAuthenticated.
 *
 * This component is framework-agnostic on purpose.
 */
interface AppNavigatorProps {
  AuthFlow: React.ComponentType;
  AppFlow: React.ComponentType;
}

export function AppNavigator({ AuthFlow, AppFlow }: AppNavigatorProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  return isAuthenticated ? <AppFlow /> : <AuthFlow />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
});