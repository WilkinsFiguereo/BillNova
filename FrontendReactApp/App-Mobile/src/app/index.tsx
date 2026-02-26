import { useRouter } from 'expo-router';
import { AuthScreen } from '../../src/features/auth/screens/AuthScreen';

export default function AuthRoute() {
  const router = useRouter();

  return (
    <AuthScreen
      onLoginSuccess={() => router.replace('../(tabs)')}
    />
  );
}