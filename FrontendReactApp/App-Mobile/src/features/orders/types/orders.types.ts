export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface OrderLine {
  id: string;
  productName: string;
  quantity: number;
  priceUnit: number;
}

export interface Order {
  id: string;
  reference: string;
  date: string;
  status: OrderStatus;
  total: number;
  lines: OrderLine[];
}

export type FilterTab = 'all' | OrderStatus;