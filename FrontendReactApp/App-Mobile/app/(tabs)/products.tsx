import React from "react";
import { useRouter } from "expo-router";
import { ProductsScreen } from "../../src/features/products/ProductsScreen";
import type { Product } from "../../src/features/home/types/home.types";

export default function ProductsTab() {
  const router = useRouter();

  const handleProductPress = (product: Product) => {
    router.push(`/product-detail/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    console.log("Add to cart:", product.name);
  };

  return (
    <ProductsScreen
      onProductPress={handleProductPress}
      onAddToCart={handleAddToCart}
    />
  );
}