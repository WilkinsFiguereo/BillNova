import { Slot } from 'expo-router';

import { AuthProvider } from '../core/providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
