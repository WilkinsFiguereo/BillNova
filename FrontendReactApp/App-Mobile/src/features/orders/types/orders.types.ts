export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export function normalizeOrderStatus(value: unknown): OrderStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'cancel' ||
    normalized === 'cancelada'
  ) {
    return 'cancelled';
  }

  if (
    normalized === 'delivered' ||
    normalized === 'entregado' ||
    normalized === 'done' ||
    normalized === 'completed'
  ) {
    return 'delivered';
  }

  if (
    normalized === 'confirmed' ||
    normalized === 'confirmado' ||
    normalized === 'paid' ||
    normalized === 'pagada' ||
    normalized === 'vencida'
  ) {
    return 'confirmed';
  }

  return 'pending';
}

export interface OrderLine {
  id: string;
  productName: string;
  quantity: number;
  priceUnit: number;
}

export interface OrderInvoice {
  id: string;
  reference: string;
  url: string;
}

export interface Order {
  id: string;
  reference: string;
  date: string;
  status: OrderStatus;
  total: number;
  lines: OrderLine[];
  invoice?: OrderInvoice | null;
}

export type FilterTab = 'all' | OrderStatus;
