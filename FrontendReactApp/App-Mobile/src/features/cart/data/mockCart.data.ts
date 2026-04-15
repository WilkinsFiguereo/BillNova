// src/features/cart/data/mockCart.data.ts
import type { PromoCode } from '../types/cart.types';

export const SHIPPING_THRESHOLD = 150;
export const SHIPPING_COST      = 9.99;
export const TAX_RATE           = 0.18;

export const validPromoCodes: PromoCode[] = [
  { code: 'SAVE10',  discount: 10, label: '10% de descuento' },
  { code: 'FIRST20', discount: 20, label: '20% primer pedido' },
];