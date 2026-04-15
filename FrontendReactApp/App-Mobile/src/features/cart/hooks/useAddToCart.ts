// src/features/cart/hooks/useAddToCart.ts
import { useCallback } from 'react';
import { useCartStore } from '../store/cartStore';
import type { CartProduct } from '../types/cart.types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900';

type RawProduct = {
  id:            string | number;
  name?:         string;
  brand?:        string;
  price?:        number;
  list_price?:   number;
  imageUri?:     string;
  image_url?:    string;
  images?:       Array<{ uri: string }>;
  colors?:       string[];
  sizes?:        string[];
  default_code?: string;
};

type Options = {
  product:  RawProduct;
  quantity: number;
  color?:   string;
  size?:    string;
};

export function useAddToCart() {
  const addToCart = useCartStore((state) => state.addToCart);

  const add = useCallback(
    ({ product, quantity, color, size }: Options) => {
      const cartProduct: CartProduct = {
        id:       String(product.id),
        name:     product.name    ?? 'Producto',
        brand:    product.brand   ?? product.default_code ?? 'Marca',
        price:    product.price   ?? product.list_price   ?? 0,
        imageUri:
          product.imageUri         ??
          product.images?.[0]?.uri ??
          product.image_url        ??
          FALLBACK_IMAGE,
        color: color ?? product.colors?.[0] ?? '#111827',
        size:  size  ?? product.sizes?.[0]  ?? 'M',
      };

      console.log('🟢 [useAddToCart] ANTES items:', useCartStore.getState().items.length);
      addToCart({ product: cartProduct, quantity });
      console.log('🟢 [useAddToCart] DESPUÉS items:', useCartStore.getState().items.length);
    },
    [addToCart],
  );

  return { add };
}