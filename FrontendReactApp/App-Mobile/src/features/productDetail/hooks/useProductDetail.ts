import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { productsApi } from '../../home/data/productsApi';
import { odooClient } from '../../../core/api/odooClient';
import { mockProduct } from '../data/mockProduct.data';
import type { ApiProductRecord, CartItem, Product } from '../types/productDetail.types';

function mapApiProductToDetail(product: ApiProductRecord): Product {
  const base = Number(product.list_price || 0);
  const original = Number((base * 1.2).toFixed(2));
  const discount = base > 0 ? Math.round((1 - base / original) * 100) : undefined;
  const imageUris = Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls
    : [product.image_url || `https://picsum.photos/seed/prod-${product.id}-1/900/900`];
  const primaryImage = imageUris[0];

  return {
    id: String(product.id),
    name: product.name || 'Producto',
    brand: product.default_code || 'Marca',
    detailType: 'product',
    description: product.description_sale || `Producto ${product.name || ''} disponible en catalogo. Contacta para mas detalles tecnicos y disponibilidad inmediata.`,
    price: base,
    originalPrice: original > base ? original : undefined,
    discount,
    rating: Number((4 + (product.id % 10) / 10).toFixed(1)),
    reviewCount: 80 + (product.id % 50) * 7,
    inStock: true,
    category: 'General',
    tags: ['catalogo', 'destacado', 'api'],
    images: imageUris.map((uri, index) => ({ id: `img-${product.id}-${index + 1}`, uri })),
    colors: ['#111827', '#1D4ED8', '#DC2626', '#F8FAFC'],
    sizes: ['S', 'M', 'L', 'XL'],
    reviews: [
      {
        id: `rev-${product.id}-1`,
        author: 'Cliente verificado',
        rating: 5,
        comment: 'Muy buen producto y envio rapido.',
        date: '2026-02-10',
      },
      {
        id: `rev-${product.id}-2`,
        author: 'Maria R.',
        rating: 4,
        comment: 'Calidad correcta, recomendado para uso diario.',
        date: '2026-01-28',
      },
    ],
  };
}

type ApiServiceRecord = {
  id: number;
  name: string;
  description?: string;
  details?: string;
  price?: number;
  payment_frequency?: string;
  image_url?: string | null;
  image_urls?: string[];
};

function mapApiServiceToDetail(service: ApiServiceRecord): Product {
  const base = Number(service.price || 0);
  const imageUris = Array.isArray(service.image_urls) && service.image_urls.length > 0
    ? service.image_urls
    : [service.image_url || `https://picsum.photos/seed/service-${service.id}-1/900/900`];
  const paymentMap: Record<string, string> = {
    unico: 'Pago unico',
    diario: 'Pago diario',
    semanal: 'Pago semanal',
    quincenal: 'Pago quincenal',
    mensual: 'Pago mensual',
    anual: 'Pago anual',
  };

  return {
    id: String(service.id * -1),
    name: service.name || 'Servicio',
    brand: 'Servicio',
    detailType: 'service',
    paymentFrequencyLabel: paymentMap[service.payment_frequency || 'unico'] || 'Pago unico',
    description: service.details || service.description || 'Servicio disponible en catalogo.',
    price: base,
    rating: Number((4.4 + (service.id % 5) / 10).toFixed(1)),
    reviewCount: 12 + (service.id % 15),
    inStock: true,
    category: 'Servicios',
    tags: ['servicio', service.payment_frequency || 'unico'],
    images: imageUris.map((uri, index) => ({ id: `srv-${service.id}-${index + 1}`, uri })),
    colors: ['#1D4ED8'],
    sizes: ['Plan'],
    reviews: [],
  };
}

export function useProductDetail(productId: number | null) {
  const [product, setProduct] = useState<Product>(mockProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(mockProduct.sizes[1] ?? mockProduct.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      if (!productId || Number.isNaN(productId)) {
        setProduct(mockProduct);
        setLoading(false);
        setError('ID de producto invalido');
        return;
      }

      if (productId < 0) {
        const response = await odooClient.get<{ ok: boolean; data?: ApiServiceRecord; error?: string }>(
          `/api/services/${Math.abs(productId)}`,
        );

        if (!mounted) return;

        if (response.error || !response.data?.ok || !response.data.data) {
          setProduct(mockProduct);
          setError(response.error || response.data?.error || 'No se pudo cargar el servicio');
          setLoading(false);
          return;
        }

        setProduct(mapApiServiceToDetail(response.data.data));
        setLoading(false);
        return;
      }

      const response = await productsApi.getById(productId);

      if (!mounted) return;

      if (response.error || !response.data?.ok || !response.data.data) {
        setProduct(mockProduct);
        setError(response.error || response.data?.error || 'No se pudo cargar el producto');
        setLoading(false);
        return;
      }

      setProduct(mapApiProductToDetail(response.data.data));
      setLoading(false);
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(product.colors[0] ?? '#111827');
    setSelectedSize(product.sizes[1] ?? product.sizes[0] ?? 'M');
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const incrementQty = useCallback(() => setQuantity((q) => Math.min(q + 1, 10)), []);
  const decrementQty = useCallback(() => setQuantity((q) => Math.max(q - 1, 1)), []);
  const toggleWishlist = useCallback(() => setIsWishlisted((w) => !w), []);

  const addToCart = useCallback((): CartItem => {
    setCartAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCartAdded(false), 1800);

    return {
      product,
      quantity,
      selectedColor,
      selectedSize,
    };
  }, [product, quantity, selectedColor, selectedSize]);

  const discountedPrice = useMemo(() => product.price, [product.price]);
  const isService = product.detailType === 'service';

  return {
    product,
    isService,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    quantity,
    incrementQty,
    decrementQty,
    isWishlisted,
    toggleWishlist,
    addToCart,
    cartAdded,
    discountedPrice,
  };
}
