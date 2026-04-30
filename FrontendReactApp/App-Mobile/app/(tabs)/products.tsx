import React, { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ProductsScreen } from "../../src/features/products/ProductsScreen";
import { useAddToCart } from "../../src/features/cart/hooks/useAddToCart";
import type { Product } from "../../src/features/home/types/home.types";

export default function ProductsTab() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { add } = useAddToCart();

  useEffect(() => {
    if (params.category) {
      // Apply category filter when navigating from drawer
      // This will be handled by ProductsScreen via the filter prop
    }
  }, [params.category]);

  const handleProductPress = (product: Product) => {
    router.push(`/product-detail/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    add({ product, quantity: 1 });
  };

  return (
    <ProductsScreen
      onProductPress={handleProductPress}
      onAddToCart={handleAddToCart}
      initialCategory={params.category}
    />
  );
}
