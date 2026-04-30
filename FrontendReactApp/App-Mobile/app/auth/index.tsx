import { Redirect, useRouter } from 'expo-router';
import { AuthScreen } from '../../src/features/auth/screens/AuthScreen';
import { useAuthContext } from '../../src/core/providers/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <AuthScreen
      onLoginSuccess={() => {
        router.replace('/'); // o '/home' o '/(app)' dependiendo tu estructura
      }}
    />
  );
}
