import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/features/products/screens/HomeScreen';

export default function HomeTab() {
  const router = useRouter();

  return (
    <HomeScreen
      onProductPress={(product) => router.push(`./(tabs)/products?id=${product.id}`)}
      onSeeAllProducts={() => router.push('./(tabs)/products')}
    />
  );
}