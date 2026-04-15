// src/features/cart/ui/CheckoutBar.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';

type Props = {
  total:      number;
  totalItems: number;
  onCheckout: () => void;
  loading:    boolean;
};

export function CheckoutBar({ total, totalItems, onCheckout, loading }: Props) {
  return (
    <View style={s.root}>
      <View style={s.summary}>
        <Text style={s.label}>
          {totalItems} producto{totalItems !== 1 ? 's' : ''}
        </Text>
        <Text style={s.total}>${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        onPress={onCheckout}
        activeOpacity={0.85}
        disabled={loading}
        style={[s.btn, loading && s.btnDisabled]}
      >
        {loading ? (
          <ActivityIndicator color={t.colors.white} size="small" />
        ) : (
          <Text style={s.btnText}>Confirmar pedido →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: t.colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: t.colors.borderLight,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.md,
    paddingBottom: 28,
    gap: t.spacing.md,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: t.font.sm,
    color: t.colors.textSecondary,
    fontWeight: '500',
  },
  total: {
    fontSize: t.font.xl,
    fontWeight: '800',
    color: t.colors.primary,
  },
  btn: {
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...t.shadow.button,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: t.colors.white,
    fontWeight: '700',
    fontSize: t.font.lg,
    letterSpacing: 0.3,
  },
});