export type ViewMode = 'grid' | 'list';

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'top_rated';

export interface FilterState {
  category:  string;       // 'all' | 'tech' | 'services' | 'clothing' | 'home' | 'mobile'
  maxPrice:  number;       // 0 = no limit
  sortBy:    SortOption;
}

export interface ActiveFilter {
  id:    string;
  label: string;
}

// Reuse Product from home feature
export type { Product } from '../../home/types/home.types';