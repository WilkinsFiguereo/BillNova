// src/features/seller/category/types/index.ts

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormValues {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
}

export interface CreateCategoryDTO extends Omit<CategoryFormValues, 'isActive'> {
  isActive?: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id: string;
}

export interface CategoryFilters {
  search?: string;
  isActive?: boolean | null;
  sortBy?: 'name' | 'productCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  totalProducts: number;
}

export type CategoryModalMode = 'create' | 'edit';

export const DEFAULT_CATEGORY_COLOR = '#1E3A8A';

export const CATEGORY_ICON_OPTIONS = [
  'Package', 'Tag', 'ShoppingBag', 'Box', 'Layers', 'Grid', 'Folder', 'Archive', 'Bookmark', 'Star', 'Laptop', 'Shirt', 'Home', 'Sparkles', 'Dumbbell'
] as const;

export type CategoryIcon = (typeof CATEGORY_ICON_OPTIONS)[number];