// src/features/cart/store/cartStore.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CartItem, AddToCartPayload, PromoCode } from '../types/cart.types';
import {
  validPromoCodes,
  SHIPPING_THRESHOLD,
  SHIPPING_COST,
  TAX_RATE,
} from '../data/mockCart.data';

const MAX_QTY = 10;
const MIN_QTY = 1;

// ✅ Storage universal: localStorage en web, AsyncStorage en nativo
// Sin import directo de AsyncStorage evitamos el error de import.meta en web
// const universalStorage = {
//   getItem: async (name: string): Promise<string | null> => {
//     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//       return localStorage.getItem(name);
//     }
//     const mod = await import('@react-native-async-storage/async-storage');
//     return mod.default.getItem(name);
//   },
//   setItem: async (name: string, value: string): Promise<void> => {
//     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//       localStorage.setItem(name, value);
//       return;
//     }
//     const mod = await import('@react-native-async-storage/async-storage');
//     await mod.default.setItem(name, value);
//   },
//   removeItem: async (name: string): Promise<void> => {
//     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//       localStorage.removeItem(name);
//       return;
//     }
//     const mod = await import('@react-native-async-storage/async-storage');
//     await mod.default.removeItem(name);
//   },
// };

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);
interface CartState {
  items:        CartItem[];
  promoInput:   string;
  appliedPromo: PromoCode | null;
  promoError:   string;
  removingId:   string | null;

  addToCart:  (payload: AddToCartPayload) => void;
  increment:  (id: string) => void;
  decrement:  (id: string) => void;
  removeItem: (id: string) => void;
  clearCart:  () => void;

  setPromoInput: (value: string) => void;
  applyPromo:    () => void;
  removePromo:   () => void;

  subtotal:              () => number;
  promoSaving:           () => number;
  taxable:               () => number;
  shipping:              () => number;
  tax:                   () => number;
  total:                 () => number;
  totalItems:            () => number;
  freeShippingRemaining: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items:        [],
      promoInput:   '',
      appliedPromo: null,
      promoError:   '',
      removingId:   null,

      addToCart: ({ product, quantity = 1 }: AddToCartPayload) => {
        const qty = Math.min(Math.max(quantity, MIN_QTY), MAX_QTY);
        set((state) => {
          const idx = state.items.findIndex(
            (item) =>
              item.product.id    === product.id &&
              item.product.color === product.color &&
              item.product.size  === product.size,
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
            items:      state.items.filter((item) => item.id !== id),
            removingId: null,
          }));
        }, 300);
      },

      clearCart: () => set({ items: [], appliedPromo: null, promoInput: '' }),

      setPromoInput: (value) => set({ promoInput: value }),

      applyPromo: () => {
        const { promoInput } = get();
        const found = validPromoCodes.find(
          (p) => p.code.toUpperCase() === promoInput.trim().toUpperCase(),
        );
        if (found) {
          set({ appliedPromo: found, promoError: '' });
        } else {
          set({ appliedPromo: null, promoError: 'Código inválido. Prueba SAVE10 o FIRST20.' });
        }
      },

      removePromo: () => set({ appliedPromo: null, promoInput: '', promoError: '' }),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),

      promoSaving: () => {
        const { appliedPromo } = get();
        const sub = get().subtotal();
        return appliedPromo ? sub * (appliedPromo.discount / 100) : 0;
      },

      taxable: () => get().subtotal() - get().promoSaving(),

      shipping: () => (get().taxable() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),

      tax: () => get().taxable() * TAX_RATE,

      total: () => get().taxable() + get().tax() + get().shipping(),

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      freeShippingRemaining: () => Math.max(0, SHIPPING_THRESHOLD - get().taxable()),
    }),
    {
      name:    'cart-storage',
      storage,
      partialize: (state) => ({
        items:        state.items,
        appliedPromo: state.appliedPromo,
        promoInput:   state.promoInput,
      }),
    },
  ),
);