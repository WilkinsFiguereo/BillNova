import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/features/home/HomeScreen';
import { useCart } from '../../src/features/cart/hooks/useCart';
import type { Product } from '../../src/features/home/types/home.types';

export default function HomeTab() {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleProductPress = (product: Product) => {
    router.push(`./product-detail/${product.id}`);
  };

  const handleSeeAllProducts = () => {
    router.push('/products');
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ product, quantity: 1 });
  };

  return (
    <HomeScreen
      onProductPress={handleProductPress}
      onSeeAllProducts={handleSeeAllProducts}
      onAddToCart={handleAddToCart}
    />
  );
}
