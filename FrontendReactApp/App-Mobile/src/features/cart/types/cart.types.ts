// src/features/cart/types/cart.types.ts

export interface CartProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUri: string;
  color: string;
  size: string;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  label: string;
}

export type AddToCartPayload = {
  product: CartProduct;
  quantity?: number;
};