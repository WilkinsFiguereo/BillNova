// src/features/cart/ui/EmptyCart.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';

type Props = { onContinue: () => void };

export function EmptyCart({ onContinue }: Props) {
  return (
    <View style={s.root}>
      <Text style={s.icon}>🛒</Text>
      <Text style={s.title}>Tu carrito está vacío</Text>
      <Text style={s.subtitle}>Agrega productos para comenzar tu pedido</Text>
      <TouchableOpacity onPress={onContinue} activeOpacity={0.85} style={s.btn}>
        <Text style={s.btnText}>Explorar productos</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing.xxl,
    gap: t.spacing.md,
  },
  icon:  { fontSize: 64, marginBottom: t.spacing.sm },
  title: {
    fontSize: t.font.xl,
    fontWeight: '700',
    color: t.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: t.font.md,
    color: t.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: t.spacing.lg,
    backgroundColor: t.colors.primary,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.full,
    ...t.shadow.button,
  },
  btnText: {
    color: t.colors.white,
    fontWeight: '700',
    fontSize: t.font.md,
  },
});