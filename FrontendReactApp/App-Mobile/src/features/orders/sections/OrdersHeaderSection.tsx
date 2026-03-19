import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ordersTheme as t } from '../theme/orders.theme';

export function OrdersHeaderSection({ total }: { total: number }) {
  return (
    <View style={s.root}>
      <Text style={s.title}>Mis Pedidos</Text>
      <Text style={s.sub}>
        Historial de compras ·{' '}
        <Text style={s.count}>{total} pedidos</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.lg },
  title: { fontSize: t.font.xxl, fontWeight: '700', color: t.colors.textPrimary, letterSpacing: -0.4 },
  sub: { fontSize: t.font.sm, color: t.colors.textSecondary, marginTop: 3 },
  count: { color: t.colors.primaryLight, fontWeight: '600' },
});