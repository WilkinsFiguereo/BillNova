import { useRouter } from 'expo-router';

import { LoginScreen } from '../../src/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      onNavigateToRegister={() => router.push('/register')}
      onLoginSuccess={() => router.replace('/(tabs)')}
    />
  );
}


