import { useRouter } from 'expo-router';

import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <RegisterScreen
      onNavigateToLogin={() => router.dismissTo('/auth')}
      onRegisterSuccess={() => router.dismissTo('/auth')}
    />
  );
}


