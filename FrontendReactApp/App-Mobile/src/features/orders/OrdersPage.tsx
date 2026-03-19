import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useOrders } from './hooks/useOrders';
import { ordersTheme as t } from './theme/orders.theme';
import { OrdersHeaderSection } from './sections/OrdersHeaderSection';
import { OrdersFilterSection } from './sections/OrdersFilterSection';
import { OrdersListSection } from './sections/OrdersListSection';
import { TopNav } from '../../features/navigation/ui/topNav';
import { BottomNav } from '../../features/navigation/ui/bottomNav';
import type { TabName } from '../../features/navigation/hooks/useNavDrawer';
import type { Order } from './types/orders.types';
import { LeftDrawer } from '../navigation/ui/leftDrawer';
import { RightDrawer } from '../navigation/ui/rightDrawer';
import { useNavDrawer } from '../navigation/hooks/useNavDrawer';
type Props = {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  onMenuPress: () => void;
  onSearchPress: () => void;
  onCartPress: () => void;
  onAvatarPress: () => void;
  cartCount?: number;
  userInitials?: string;
  onPressOrder?: (order: Order) => void;
};

export function OrdersPage({
  activeTab, onTabPress, onMenuPress, onSearchPress,
  onCartPress, onAvatarPress, cartCount = 0,
  userInitials = 'U', onPressOrder = () => {},
}: Props) {
  const { orders, totalOrders, loading, error, activeFilter, setActiveFilter, search, setSearch } = useOrders();
  const {
      leftOpen,
      rightOpen,
      openLeft,
      openRight,
      closeAll,
    } = useNavDrawer();
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={t.colors.bgCard} />

      <TopNav
        cartCount={cartCount}
        onMenuPress={onMenuPress}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        onAvatarPress={onAvatarPress}
        userInitials={userInitials}
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <OrdersHeaderSection total={totalOrders} />

        <OrdersFilterSection
          active={activeFilter}
          search={search}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearch}
        />

        <OrdersListSection
          orders={orders}
          loading={loading}
          error={error}
          onPressOrder={onPressOrder}
        />
      </ScrollView>

      {/* 📂 Drawers */}
      <LeftDrawer open={leftOpen} onClose={closeAll} />
      <RightDrawer open={rightOpen} onClose={closeAll} />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.bgMain },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
});