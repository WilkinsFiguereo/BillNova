import { useState, useCallback, useMemo } from 'react';
import { CartItem } from '../types/cart.types';
import {
  mockCartItems,
  validPromoCodes,
  SHIPPING_THRESHOLD,
  SHIPPING_COST,
  TAX_RATE,
} from '../data/mockCart.data';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(mockCartItems);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<null | { discount: number; label: string }>(null);
  const [promoError, setPromoError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Mutations ──────────────────────────────────────────────

  const increment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, 10) } : i))
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setRemovingId(null);
    }, 300);
  }, []);

  const applyPromo = useCallback(() => {
    const found = validPromoCodes.find(
      (p) => p.code.toUpperCase() === promoInput.trim().toUpperCase()
    );
    if (found) {
      setAppliedPromo({ discount: found.discount, label: found.label });
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try SAVE10 or FIRST20.');
      setAppliedPromo(null);
    }
  }, [promoInput]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  }, []);

  // ── Derived totals ─────────────────────────────────────────

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    [items]
  );

  const promoSaving = useMemo(
    () => (appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0),
    [subtotal, appliedPromo]
  );

  const shipping = subtotal - promoSaving >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const taxable = subtotal - promoSaving;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax + shipping;
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const freeShippingRemaining = Math.max(0, SHIPPING_THRESHOLD - (subtotal - promoSaving));

  return {
    items,
    promoInput,
    setPromoInput,
    appliedPromo,
    promoError,
    removingId,
    increment,
    decrement,
    removeItem,
    applyPromo,
    removePromo,
    subtotal,
    promoSaving,
    shipping,
    tax,
    total,
    totalItems,
    freeShippingRemaining,
    SHIPPING_THRESHOLD,
  };
}