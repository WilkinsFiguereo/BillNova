// src/features/cart/data/checkoutApi.ts
import { odooClient } from '../../../core/api/odooClient';
import type { CartItem } from '../types/cart.types';

type PosOrderResponse = {
  ok: boolean;
  order_id?: number;
  error?: string;
};

export async function submitPosOrder(
  items: CartItem[],
  tax: number,
  total: number,
): Promise<{ ok: boolean; order_id?: number; error?: string }> {
  const payload = {
    lines: items.map((item) => ({
      // Services are represented with negative ids in the mobile UI.
      // POS expects the real product.product id from Odoo.
      product_id: Math.abs(Number(item.product.id)),
      qty:        item.quantity,
      price_unit: item.product.price,
    })),
    amount_tax:   tax,
    amount_total: total,
  };

  const { data, error } = await odooClient.post<PosOrderResponse>(
    '/api/pos/order',
    payload,
    { requiresAuth: true },
  );

  if (error) return { ok: false, error };
  if (!data)  return { ok: false, error: 'No se pudo procesar el pedido' };
  return data;
}
