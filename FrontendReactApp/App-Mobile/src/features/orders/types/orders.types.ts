export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

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
