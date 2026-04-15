// src/features/cart/ui/CartItemCard.tsx
import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { cartTheme as t } from '../theme/cart.theme';
import type { CartItem } from '../types/cart.types';

type Props = {
  item:        CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove:    () => void;
  isRemoving:  boolean;
};

export function CartItemCard({ item, onIncrement, onDecrement, onRemove, isRemoving }: Props) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <View style={[s.card, isRemoving && s.cardRemoving]}>
      <Image source={{ uri: product.imageUri }} style={s.image} resizeMode="cover" />

      <View style={s.info}>
        <View style={s.topRow}>
          <Text style={s.brand}>{product.brand}</Text>
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={s.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.name} numberOfLines={2}>{product.name}</Text>

        <View style={s.badgeRow}>
          <View style={s.badge}>
            <View style={[s.colorDot, { backgroundColor: product.color }]} />
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>{product.size}</Text>
          </View>
        </View>

        <View style={s.bottomRow}>
          <Text style={s.price}>${lineTotal.toFixed(2)}</Text>
          <View style={s.qtyRow}>
            <TouchableOpacity onPress={onDecrement} style={s.qtyBtn} activeOpacity={0.7}>
              <Text style={s.qtyOp}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyNum}>{quantity}</Text>
            <TouchableOpacity onPress={onIncrement} style={s.qtyBtn} activeOpacity={0.7}>
              <Text style={s.qtyOp}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: t.colors.bgCard,
    borderRadius: t.radius.lg,
    marginBottom: t.spacing.md,
    overflow: 'hidden',
    ...t.shadow.card,
  },
  cardRemoving: { opacity: 0.4 },
  image: { width: 96, height: 112 },
  info: {
    flex: 1,
    padding: t.spacing.md,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: t.font.xs,
    fontWeight: '600',
    color: t.colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    fontSize: 12,
    color: t.colors.textDisabled,
    fontWeight: '600',
  },
  name: {
    fontSize: t.font.md,
    fontWeight: '600',
    color: t.colors.textPrimary,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: t.spacing.xs,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.bgAlt,
    borderRadius: t.radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: t.font.xs,
    fontWeight: '600',
    color: t.colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: t.spacing.xs,
  },
  price: {
    fontSize: t.font.lg,
    fontWeight: '700',
    color: t.colors.primary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.bgAlt,
    borderRadius: t.radius.md,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyOp: {
    fontSize: 18,
    fontWeight: '400',
    color: t.colors.primary,
    lineHeight: 20,
  },
  qtyNum: {
    width: 26,
    textAlign: 'center',
    fontSize: t.font.md,
    fontWeight: '700',
    color: t.colors.textPrimary,
  },
});