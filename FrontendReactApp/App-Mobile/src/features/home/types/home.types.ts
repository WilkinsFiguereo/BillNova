export interface Product {
  id: number;
  name: string;
  default_code: string | null;
  list_price: number;
  catalog_type?: 'product' | 'service';
  kind_label?: string;
  moderation_status?: 'pending' | 'approved' | 'rejected' | string;
  category?: string;
  category_name?: string;
  image_url?: string;
  description?: string;
  description_sale?: string;
  company_name?: string;
  payment_frequency?: string | null;
  payment_frequency_label?: string | null;
  rating?: number;
  review_count?: number;
  badge?: 'sale' | 'new' | null;
  discount_percent?: number;
  is_favorite?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: 'grid' | 'monitor' | 'settings' | 'shirt' | 'home' | 'smartphone';
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
