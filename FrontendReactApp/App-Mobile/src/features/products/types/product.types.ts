export interface Product {
  id: number;
  name: string;
  default_code: string | null;
  list_price: number;
  catalog_type?: 'product' | 'service';
  moderation_status?: 'pending' | 'approved' | 'rejected' | string;
  category?: string;
  image_url?: string;
  description?: string;
  company_name?: string;
  payment_frequency?: string | null;
  payment_frequency_label?: string | null;
}

export interface ProductsResponse {
  ok: boolean;
  data: Product[];
}

export interface ProductResponse {
  ok: boolean;
  data?: Product;
  error?: string;
}

export interface CreateProductPayload {
  name: string;
  default_code?: string;
  list_price?: number;
}

export interface UpdateProductPayload {
  name?: string;
  default_code?: string;
  list_price?: number;
}
