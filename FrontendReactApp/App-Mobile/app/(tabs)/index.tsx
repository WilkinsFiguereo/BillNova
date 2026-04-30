import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/features/home/HomeScreen';
import { useAddToCart } from '../../src/features/cart/hooks/useAddToCart';
import type { Product } from '../../src/features/home/types/home.types';

export default function HomeTab() {
  const router = useRouter();
  const { add } = useAddToCart();

  const handleProductPress = (product: Product) => {
    router.push(`./product-detail/${product.id}`);
  };

  const handleSeeAllProducts = () => {
    router.push('/products');
  };

  const handleAddToCart = (product: Product) => {
    add({ product, quantity: 1 });
  };

  return (
    <HomeScreen
      onProductPress={handleProductPress}
      onSeeAllProducts={handleSeeAllProducts}
      onAddToCart={handleAddToCart}
    />
  );
}
