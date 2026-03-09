import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/features/home/HomeScreen';
import type { Product } from '../../src/features/home/types/home.types';

export default function HomeTab() {
  const router = useRouter();

  const handleProductPress = (product: Product) => {
    router.push(`./product-detail/${product.id}`);
  };

  const handleSeeAllProducts = () => {
    router.push('/products');
  };

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product.id);
  };

  return (
    <HomeScreen
      onProductPress={handleProductPress}
      onSeeAllProducts={handleSeeAllProducts}
      onAddToCart={handleAddToCart}
    />
  );
}