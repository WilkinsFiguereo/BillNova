// src/features/cart/store/cartStore.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CartItem, AddToCartPayload, PromoCode } from '../types/cart.types';
import {
  SHIPPING_THRESHOLD,
  SHIPPING_COST,
  TAX_RATE,
} from '../data/mockCart.data';

const MAX_QTY = 10;
const MIN_QTY = 1;

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

interface CartState {
  items: CartItem[];
  promoInput: string;
  appliedPromo: PromoCode | null;
  promoError: string;
  removingId: string | null;

  addToCart: (payload: AddToCartPayload) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  setPromoInput: (value: string) => void;
  applyPromo: () => void;
  removePromo: () => void;

  subtotal: () => number;
  promoSaving: () => number;
  taxable: () => number;
  shipping: () => number;
  tax: () => number;
  total: () => number;
  totalItems: () => number;
  freeShippingRemaining: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoInput: '',
      appliedPromo: null,
      promoError: '',
      removingId: null,

      addToCart: ({ product, quantity = 1 }: AddToCartPayload) => {
        const qty = Math.min(Math.max(quantity, MIN_QTY), MAX_QTY);
        set((state) => {
          const idx = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.product.color === product.color &&
              item.product.size === product.size,
          );
          if (idx >= 0) {
            return {
              items: state.items.map((item, i) =>
                i === idx
                  ? { ...item, quantity: Math.min(item.quantity + qty, MAX_QTY) }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                product,
                quantity: qty,
              },
            ],
          };
        });
      },

      increment: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QTY) }
              : item,
          ),
        })),

      decrement: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(item.quantity - 1, MIN_QTY) }
              : item,
          ),
        })),

      removeItem: (id) => {
        set({ removingId: id });
        setTimeout(() => {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            removingId: null,
          }));
        }, 300);
      },

      clearCart: () => set({ items: [], appliedPromo: null, promoInput: '', promoError: '' }),

      setPromoInput: (value) => set({ promoInput: value }),
      applyPromo: () => set({ appliedPromo: null, promoError: 'Los descuentos no estan disponibles.' }),
      removePromo: () => set({ appliedPromo: null, promoInput: '', promoError: '' }),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),

      promoSaving: () => 0,
      taxable: () => get().subtotal(),
      shipping: () => (get().taxable() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),
      tax: () => get().taxable() * TAX_RATE,
      total: () => get().taxable() + get().tax() + get().shipping(),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      freeShippingRemaining: () => Math.max(0, SHIPPING_THRESHOLD - get().taxable()),
    }),
    {
      name: 'cart-storage',
      storage,
      partialize: (state) => ({
        items: state.items,
        appliedPromo: null,
        promoInput: '',
      }),
    },
  ),
);
