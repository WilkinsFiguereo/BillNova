import { RegisterScreen } from '../features/auth/screens/RegisterScreen';

export default function IndexPage() {
  return (
    <RegisterScreen
      onNavigateToLogin={() => {}}
      onRegisterSuccess={() => {}}
    />
  );
}
