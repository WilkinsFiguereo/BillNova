import React, { useState } from 'react';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';

type AuthPage = 'login' | 'register';

interface AuthFlowProps {
  onLoginSuccess?: () => void;
}

/**
 * AuthFlow manages local navigation between Login and Register screens
 * without requiring a navigation library for the auth layer.
 *
 * Replace with a React Navigation Stack or Expo Router file routes if preferred.
 */
export function AuthFlow({ onLoginSuccess }: AuthFlowProps) {
  const [page, setPage] = useState<AuthPage>('login');

  if (page === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={() => setPage('login')}
        onRegisterSuccess={() => setPage('login')}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToRegister={() => setPage('register')}
      onLoginSuccess={() => onLoginSuccess?.()}
    />
  );
}