// src/features/cart/CartPage.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';

import { useCart }            from './hooks/useCart';
import { cartTheme as t }     from './theme/cart.theme';
import { submitPosOrder }     from './data/checkoutApi';
import { CartItemCard }       from './ui/CartItemCard';
import { EmptyCart }          from './ui/EmptyCart';
import { CheckoutBar }        from './ui/CheckoutBar';
import { FreeShippingBanner } from './sections/FreeShippingBanner';
import { PromoCodeInput }     from './sections/PromoCodeInput';
import { OrderSummary }       from './sections/OrderSummary';

type Props = {
  navigation?: { goBack: () => void };
};

export function CartPage({ navigation }: Props) {
  const {
    items,
    promoInput,   setPromoInput,
    appliedPromo, promoError,
    removingId,
    increment,    decrement, removeItem,
    applyPromo,   removePromo,
    subtotal,     promoSaving, shipping, tax, total,
    totalItems,   freeShippingRemaining, SHIPPING_THRESHOLD,
    clearCart,
  } = useCart();
  
  const isEmpty = items.length === 0;
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const result = await submitPosOrder(items, tax, total);
      if (result.ok) {
        clearCart();
        Alert.alert('¡Pedido creado!', `Orden #${result.order_id ?? '—'}`);
      } else {
        Alert.alert('Error', result.error ?? 'No se pudo crear el pedido');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar hidden barStyle="dark-content" backgroundColor={t.colors.bgCard} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
          style={s.headerBtn}
        >
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Mi Carrito</Text>
          {!isEmpty && (
            <View style={s.countBadge}>
              <Text style={s.countText}>{totalItems}</Text>
            </View>
          )}
        </View>

        <View style={s.headerBtn} />
      </View>

      {isEmpty ? (
        <EmptyCart onContinue={() => navigation?.goBack()} />
      ) : (
        <>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FreeShippingBanner
              remaining={freeShippingRemaining}
              threshold={SHIPPING_THRESHOLD}
            />

            <Text style={s.sectionLabel}>
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </Text>

            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onIncrement={() => increment(item.id)}
                onDecrement={() => decrement(item.id)}
                onRemove={() => removeItem(item.id)}
                isRemoving={removingId === item.id}
              />
            ))}

            <View style={s.promoWrap}>
              <Text style={s.sectionLabel}>Código de descuento</Text>
              <PromoCodeInput
                value={promoInput}
                onChange={setPromoInput}
                onApply={applyPromo}
                onRemove={removePromo}
                applied={appliedPromo}
                error={promoError}
              />
            </View>

            <OrderSummary
              subtotal={subtotal}
              promoSaving={promoSaving}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </ScrollView>

          <CheckoutBar
            total={total}
            totalItems={totalItems}
            onCheckout={handleCheckout}
            loading={isCheckingOut}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: t.colors.bgMain,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderLight,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: t.colors.textPrimary,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  headerTitle: {
    fontSize: t.font.lg,
    fontWeight: '700',
    color: t.colors.textPrimary,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countText: {
    fontSize: t.font.xs,
    fontWeight: '700',
    color: t.colors.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: t.colors.bgMain,
  },
  scrollContent: {
    padding: t.spacing.xl,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: t.font.sm,
    fontWeight: '600',
    color: t.colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: t.spacing.md,
  },
  promoWrap: {
    marginTop: t.spacing.lg,
    marginBottom: t.spacing.lg,
    gap: t.spacing.md,
  },
});
