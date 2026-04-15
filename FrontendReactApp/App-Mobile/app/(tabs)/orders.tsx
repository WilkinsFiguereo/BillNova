import React from "react";
import { useRouter } from "expo-router";
import { OrdersPage } from "../../src/features/orders/OrdersPage";
import { useCart } from "../../src/features/cart/hooks/useCart";

export default function OrdersTab() {
  const router = useRouter();
  const { totalItems } = useCart();

  return (
    <OrdersPage
      onMenuPress={() => console.log("menu")}
      onSearchPress={() => console.log("search")}
      onCartPress={() => router.push("/cart")}
      onAvatarPress={() => console.log("avatar")}
      cartCount={totalItems}
      userInitials="W"
    />
  );
}
