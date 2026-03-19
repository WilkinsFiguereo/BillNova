import React from "react";
import { useRouter } from "expo-router";
import { OrdersPage } from "../../src/features/orders/OrdersPage";
import type { TabName } from "../../src/features/navigation/hooks/useNavDrawer";
import type { Order } from "../../src/features/orders/types/orders.types";

export default function OrdersTab() {
  const router = useRouter();

  const handleTabPress = (tab: TabName) => {
    switch (tab) {
      case "home":
        router.push("/");
        break;
      case "products":
        router.push("/products");
        break;
      case "orders":
        router.push("/orders");
        break;
      case "cart":
        router.push("/cart");
        break;
      default:
        break;
    }
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/order-detail/${order.id}` as any);
  };

  return (
    <OrdersPage
      activeTab="orders"
      onTabPress={handleTabPress}
      onMenuPress={() => console.log("menu")}
      onSearchPress={() => console.log("search")}
      onCartPress={() => router.push("/cart")}
      onAvatarPress={() => console.log("avatar")}
      cartCount={2}
      userInitials="W"
      onPressOrder={handleOrderPress}
    />
  );
}