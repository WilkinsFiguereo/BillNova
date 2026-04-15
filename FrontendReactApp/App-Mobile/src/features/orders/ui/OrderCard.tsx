import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ordersTheme as t } from '../theme/orders.theme';
import type { Order, OrderStatus } from '../types/orders.types';

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: t.colors.warning,  bg: t.colors.warningSoft },
  confirmed: { label: 'Confirmado', color: t.colors.primaryLight, bg: t.colors.primarySoft },
  delivered: { label: 'Entregado',  color: t.colors.success,  bg: t.colors.successSoft },
  cancelled: { label: 'Cancelado',  color: t.colors.error,    bg: t.colors.errorSoft },
};

export function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const { label, color, bg } = STATUS_CONFIG[order.status];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={s.card}>
      {/* Top row */}
      <View style={s.topRow}>
        <View>
          <Text style={s.ref}>{order.reference}</Text>
          <Text style={s.date}>{order.date}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: bg }]}>
          <Text style={[s.badgeText, { color }]}>{label}</Text>
        </View>
      </View>

      {/* Lines preview */}
      {order.lines.slice(0, 2).map((line) => (
        <View key={line.id} style={s.lineRow}>
          <View style={s.lineDot} />
          <Text style={s.lineName} numberOfLines={1}>{line.productName}</Text>
          <Text style={s.lineQty}>x{line.quantity}</Text>
          <Text style={s.linePrice}>${(line.priceUnit * line.quantity).toFixed(2)}</Text>
        </View>
      ))}
      {order.lines.length > 2 && (
        <Text style={s.moreLines}>+{order.lines.length - 2} productos más</Text>
      )}

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.itemCount}>{order.lines.length} artículo{order.lines.length !== 1 ? 's' : ''}</Text>
        <Text style={s.total}>${order.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
    borderWidth: 1,
    borderColor: t.colors.border,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: t.spacing.md,
  },
  ref: { fontSize: t.font.md, fontWeight: '700', color: t.colors.textPrimary },
  date: { fontSize: t.font.sm, color: t.colors.textDisabled, marginTop: 2 },
  badge: {
    paddingHorizontal: t.spacing.md, paddingVertical: 4,
    borderRadius: t.radius.full,
  },
  badgeText: { fontSize: t.font.xs, fontWeight: '700' },
  lineRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: t.spacing.sm, marginBottom: 6,
  },
  lineDot: {
    width: 5, height: 5, borderRadius: t.radius.full,
    backgroundColor: t.colors.primaryLight,
  },
  lineName: {
    flex: 1, fontSize: t.font.sm, color: t.colors.textSecondary,
  },
  lineQty: { fontSize: t.font.sm, color: t.colors.textDisabled },
  linePrice: { fontSize: t.font.sm, fontWeight: '600', color: t.colors.textPrimary },
  moreLines: {
    fontSize: t.font.xs, color: t.colors.textDisabled,
    marginBottom: t.spacing.sm, marginLeft: t.spacing.md,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: t.spacing.md,
    paddingTop: t.spacing.md, borderTopWidth: 1,
    borderTopColor: t.colors.borderLight,
  },
  itemCount: { fontSize: t.font.sm, color: t.colors.textDisabled },
  total: { fontSize: t.font.lg, fontWeight: '800', color: t.colors.primary },
});
