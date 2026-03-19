import { Redirect } from 'expo-router';
import { useAuthContext } from '../src/core/providers/AuthProvider';
import { View, Text } from 'react-native';
export default function Index() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Cargando...</Text>
    </View>
  );
}

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)" />;
}