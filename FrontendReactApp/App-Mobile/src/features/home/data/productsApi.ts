import { odooClient } from '../../../core/api/odooClient';
import type { ProductsResponse, ProductResponse } from '../types/home.types';

export const productsApi = {
  list: () =>
    odooClient.get<ProductsResponse>('/api/mobile/products'),

  getById: (id: number) =>
    odooClient.get<ProductResponse>(`/api/mobile/products/${id}`),
};
