import { odooClient } from '../../../core/api/odooClient';
import type { Order } from '../types/orders.types';

interface OrdersResponse {
  ok: boolean;
  data?: Order[];
  error?: string;
}

export const ordersApi = {
  async getAll(): Promise<{ ok: boolean; data?: Order[]; error?: string }> {
    const res = await odooClient.get<OrdersResponse>('/api/pos/orders');
    if (res.error) return { ok: false, error: res.error };
    return { ok: true, data: res.data?.data ?? [] };
  },
};