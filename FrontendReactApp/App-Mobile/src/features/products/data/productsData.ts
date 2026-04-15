import type { SortOption } from '../types/products.types';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance',  label: 'Relevancia' },
  { value: 'price_asc',  label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'top_rated',  label: 'Más valorados' },
];

export const FILTER_CATEGORIES = [
  { id: 'all',      label: 'Todo',       icon: 'grid' },
  { id: 'tech',     label: 'Tech',       icon: 'monitor' },
  { id: 'services', label: 'Servicios',  icon: 'settings' },
  { id: 'clothing', label: 'Ropa',       icon: 'shirt' },
  { id: 'home',     label: 'Hogar',      icon: 'home' },
  { id: 'mobile',   label: 'Móviles',    icon: 'smartphone' },
];

export const MAX_PRICE_LIMIT = 500_000; // RD$500,000