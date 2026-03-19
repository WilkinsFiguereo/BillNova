// src/features/cart/sections/OrderSummary.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';

type Props = {
  subtotal:    number;
  promoSaving: number;
  shipping:    number;
  tax:         number;
  total:       number;
};

function Row({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, highlight && s.rowLabelBold]}>{label}</Text>
      <Text style={[s.rowValue, highlight && s.rowValueBold]}>{value}</Text>
    </View>
  );
}

export function OrderSummary({ subtotal, promoSaving, shipping, tax, total }: Props) {
  return (
    <View style={s.card}>
      <Text style={s.title}>Resumen del pedido</Text>

      <Row label="Subtotal"     value={`$${subtotal.toFixed(2)}`} />
      {promoSaving > 0 && (
        <Row label="Descuento"  value={`-$${promoSaving.toFixed(2)}`} />
      )}
      <Row label="Envío"        value={shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`} />
      <Row label="ITBIS (18%)"  value={`$${tax.toFixed(2)}`} />

      <View style={s.divider} />
      <Row label="Total"        value={`$${total.toFixed(2)}`} highlight />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
    ...t.shadow.card,
  },
  title: {
    fontSize: t.font.md,
    fontWeight: '700',
    color: t.colors.textPrimary,
    marginBottom: t.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: t.font.md,
    color: t.colors.textSecondary,
  },
  rowLabelBold: {
    fontWeight: '700',
    color: t.colors.textPrimary,
    fontSize: t.font.lg,
  },
  rowValue: {
    fontSize: t.font.md,
    color: t.colors.textSecondary,
    fontWeight: '500',
  },
  rowValueBold: {
    fontWeight: '800',
    color: t.colors.primary,
    fontSize: t.font.lg,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.borderLight,
    marginVertical: t.spacing.xs,
  },
});