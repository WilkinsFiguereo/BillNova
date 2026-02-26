import { useRouter } from 'expo-router';

import { RegisterScreen } from '../../src/features/auth/screens/RegisterScreen';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onNavigateToLogin={() => router.push('/login')}
      onRegisterSuccess={() => router.replace('/login')}
    />
  );
}


