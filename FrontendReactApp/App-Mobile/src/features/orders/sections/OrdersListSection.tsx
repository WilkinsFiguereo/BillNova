import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ordersTheme as t } from '../theme/orders.theme';
import { OrderCard } from '../ui/OrderCard';
import type { Order } from '../types/orders.types';

interface Props {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onPressOrder: (order: Order) => void;
}

export function OrdersListSection({ orders, loading, error, onPressOrder }: Props) {
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={t.colors.primary} />
        <Text style={s.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>No hay pedidos aún</Text>
        <Text style={s.emptySubText}>Tus compras aparecerán aquí</Text>
      </View>
    );
  }

  return (
    <View style={s.list}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onPress={() => onPressOrder(order)} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: t.spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xxl, gap: t.spacing.sm },
  loadingText: { fontSize: t.font.md, color: t.colors.textSecondary },
  errorText: { fontSize: t.font.md, color: t.colors.error, textAlign: 'center' },
  emptyText: { fontSize: t.font.lg, fontWeight: '700', color: t.colors.textPrimary },
  emptySubText: { fontSize: t.font.sm, color: t.colors.textDisabled },
});