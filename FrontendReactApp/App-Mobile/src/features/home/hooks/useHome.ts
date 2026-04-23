import { useState, useEffect, useCallback } from 'react';
import { odooClient } from '../../../core/api/odooClient';
import { getProductImage } from '../data/homeData';
import type { Product, ProductsResponse } from '../types/home.types';

type ServiceApiItem = {
  id: number;
  name: string;
  description?: string;
  details?: string;
  price?: number;
  payment_frequency?: string;
  image_url?: string | null;
  moderation_status?: string;
  company_name?: string;
  create_date?: string | null;
};

type ServicesResponse = {
  ok: boolean;
  data: ServiceApiItem[];
};

const PAYMENT_LABELS: Record<string, string> = {
  unico: 'Pago unico',
  diario: 'Pago diario',
  semanal: 'Pago semanal',
  quincenal: 'Pago quincenal',
  mensual: 'Pago mensual',
  anual: 'Pago anual',
};

function mapProducts(data: ProductsResponse['data'] = []): Product[] {
  return data
    .filter((product) => product.moderation_status === 'approved')
    .map((product, index) => ({
      ...product,
      catalog_type: 'product',
      kind_label: 'Producto',
      image_url: product.image_url || getProductImage(product.id),
      rating: 3.5 + (product.id % 3) * 0.5,
      review_count: 20 + (product.id % 80),
      badge: index % 5 === 0 ? 'sale' : index % 7 === 0 ? 'new' : null,
      discount_percent: index % 5 === 0 ? 10 + (index % 20) : undefined,
      is_favorite: false,
      category: product.category ?? product.category_name ?? 'Productos',
      description: product.description ?? product.description_sale ?? '',
      company_name: product.company_name ?? '',
      payment_frequency: null,
      payment_frequency_label: null,
    }));
}

function mapServices(data: ServiceApiItem[] = [], offset: number): Product[] {
  return data
    .filter((service) => service.moderation_status === 'approved')
    .map((service, index) => ({
      id: service.id * -1,
      name: service.name,
      default_code: `SRV-${service.id}`,
      list_price: service.price ?? 0,
      catalog_type: 'service',
      kind_label: 'Servicio',
      moderation_status: service.moderation_status ?? 'pending',
      category: 'Servicios',
      image_url: service.image_url || getProductImage(offset + index + 1),
      description: service.description || service.details || '',
      company_name: service.company_name ?? '',
      payment_frequency: service.payment_frequency ?? 'unico',
      payment_frequency_label: PAYMENT_LABELS[service.payment_frequency ?? 'unico'] ?? 'Pago unico',
      rating: 4 + (service.id % 2) * 0.5,
      review_count: 8 + (service.id % 30),
      badge: index % 4 === 0 ? 'new' : null,
      discount_percent: undefined,
      is_favorite: false,
    }));
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    const [productsResponse, servicesResponse] = await Promise.all([
      odooClient.get<ProductsResponse>('/api/products', { requiresAuth: true }),
      odooClient.get<ServicesResponse>('/api/services'),
    ]);

    if (!productsResponse.data?.ok && !servicesResponse.data?.ok) {
      setError(productsResponse.error ?? servicesResponse.error ?? 'No se pudo cargar el catalogo');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    const mappedProducts = mapProducts(productsResponse.data?.data ?? []);
    const mappedServices = mapServices(servicesResponse.data?.data ?? [], mappedProducts.length);
    setProducts([...mappedProducts, ...mappedServices]);

    setIsLoading(false);
    setRefreshing(false);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const toggleFavorite = useCallback((id: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, is_favorite: !product.is_favorite }
          : product
      )
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const featured = [...products]
    .sort((a, b) => b.list_price - a.list_price)
    .slice(0, 6);

  return { products, featured, isLoading, error, refreshing, refresh, toggleFavorite };
}

export function useProductSearch(products: Product[]) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActive] = useState('all');

  const filtered = products.filter((product) => {
    const matchesQuery =
      !query.trim() ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.default_code ?? '').toLowerCase().includes(query.toLowerCase());

    const matchesCat =
      activeCategory === 'all' ||
      (activeCategory === 'tech' && product.category === 'Tecnologia') ||
      (activeCategory === 'services' && product.catalog_type === 'service') ||
      (activeCategory === 'clothing' && product.category === 'Moda') ||
      (activeCategory === 'home' && product.category === 'Hogar') ||
      (activeCategory === 'mobile' && product.category === 'Accesorios');

    return matchesQuery && matchesCat;
  });

  return { query, setQuery, activeCategory, setActive, filtered };
}
