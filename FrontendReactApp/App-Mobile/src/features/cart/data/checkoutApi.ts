import type { CartItem } from '../types/cart.types';

const BASE_URL = 'http://localhost:8079/api';

export async function submitPosOrder(items: CartItem[], tax: number, total: number) {
  try {
    const res = await fetch(`${BASE_URL}/pos/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lines: items.map(item => ({
          product_id: Number(item.product.id),
          qty: item.quantity,
          price_unit: item.product.price,
        })),
        amount_tax: tax,
        amount_total: total,
      }),
    });

    return await res.json();
  } catch (e) {
    return { ok: false, error: 'Error de conexión con el servidor' };
  }
}