// src/features/cart/hooks/useCart.ts
import { useCartStore } from '../store/cartStore';

export function useCart() {
  const store = useCartStore();

  return {
    items:        store.items,
    promoInput:   store.promoInput,
    appliedPromo: store.appliedPromo,
    promoError:   store.promoError,
    removingId:   store.removingId,

    addToCart:     store.addToCart,
    increment:     store.increment,
    decrement:     store.decrement,
    removeItem:    store.removeItem,
    clearCart:     store.clearCart,

    setPromoInput: store.setPromoInput,
    applyPromo:    store.applyPromo,
    removePromo:   store.removePromo,

    subtotal:              store.subtotal(),
    promoSaving:           store.promoSaving(),
    shipping:              store.shipping(),
    tax:                   store.tax(),
    total:                 store.total(),
    totalItems:            store.totalItems(),
    freeShippingRemaining: store.freeShippingRemaining(),
    SHIPPING_THRESHOLD:    150,
  };
}