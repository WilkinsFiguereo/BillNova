// src/features/cart/sections/FreeShippingBanner.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';

type Props = { remaining: number; threshold: number };

export function FreeShippingBanner({ remaining, threshold }: Props) {
  const progress  = Math.min(1, 1 - remaining / threshold);
  const achieved  = remaining === 0;

  return (
    <View style={s.root}>
      <Text style={s.text}>
        {achieved
          ? '🎉 ¡Envío gratis desbloqueado!'
          : `Agrega $${remaining.toFixed(2)} más para envío gratis`}
      </Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${progress * 100}%` as any }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: t.colors.primarySoft,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
    marginBottom: t.spacing.lg,
    gap: t.spacing.sm,
  },
  text: {
    fontSize: t.font.sm,
    fontWeight: '600',
    color: t.colors.primary,
  },
  track: {
    height: 6,
    backgroundColor: t.colors.white,
    borderRadius: t.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.full,
  },
});