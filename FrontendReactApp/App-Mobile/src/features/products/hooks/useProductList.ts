import { useState, useCallback, useMemo } from 'react';
import type { Product } from '../../home/types/home.types';
import type { FilterState, ViewMode, ActiveFilter } from '../types/products.types';
import { MAX_PRICE_LIMIT } from '../data/productsData';

const DEFAULT_FILTER: FilterState = {
  category: 'all',
  maxPrice: 0,
  sortBy:   'relevance',
};

const CATEGORY_MAP: Record<string, string> = {
  tech:     'Tecnología',
  services: 'Servicios',
  clothing: 'Moda',
  home:     'Hogar',
  mobile:   'Accesorios',
};

export function useProductList(products: Product[]) {
  const [query,        setQuery]        = useState('');
  const [filter,       setFilter]       = useState<FilterState>(DEFAULT_FILTER);
  const [pendingFilter,setPending]      = useState<FilterState>(DEFAULT_FILTER);
  const [viewMode,     setViewMode]     = useState<ViewMode>('grid');
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [favIds,       setFavIds]       = useState<Set<number>>(new Set());

  // ── Derived: filtered + sorted results ───────────────────────
  const results = useMemo(() => {
    let list = [...products];

    // 1. Search
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        String(p.default_code ?? '').toLowerCase().includes(q)
      );
    }

    // 2. Category
    if (filter.category !== 'all') {
      const cat = CATEGORY_MAP[filter.category];
      if (cat) list = list.filter(p => p.category === cat);
    }

    // 3. Max price
    if (filter.maxPrice > 0) {
      list = list.filter(p => p.list_price <= filter.maxPrice);
    }

    // 4. Sort
    switch (filter.sortBy) {
      case 'price_asc':  list.sort((a, b) => a.list_price - b.list_price); break;
      case 'price_desc': list.sort((a, b) => b.list_price - a.list_price); break;
      case 'top_rated':  list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default: break; // relevance = API order
    }

    return list;
  }, [products, query, filter]);

  // ── Active filter tags ────────────────────────────────────────
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const tags: ActiveFilter[] = [];
    if (filter.category !== 'all') {
      tags.push({ id: 'cat', label: CATEGORY_MAP[filter.category] ?? filter.category });
    }
    if (filter.maxPrice > 0) {
      tags.push({ id: 'price', label: `Hasta RD$${filter.maxPrice.toLocaleString()}` });
    }
    if (filter.sortBy !== 'relevance') {
      const labels: Record<string, string> = {
        price_asc:  'Menor precio',
        price_desc: 'Mayor precio',
        top_rated:  'Más valorados',
      };
      tags.push({ id: 'sort', label: labels[filter.sortBy] });
    }
    return tags;
  }, [filter]);

  // ── Actions ───────────────────────────────────────────────────
  const openFilter  = useCallback(() => { setPending(filter); setFilterOpen(true);  }, [filter]);
  const closeFilter = useCallback(() => setFilterOpen(false), []);
  const applyFilter = useCallback(() => { setFilter(pendingFilter); setFilterOpen(false); }, [pendingFilter]);
  const resetFilter = useCallback(() => { setPending(DEFAULT_FILTER); }, []);
  const clearAllFilters = useCallback(() => setFilter(DEFAULT_FILTER), []);

  const removeFilter = useCallback((id: string) => {
    setFilter(prev => ({
      ...prev,
      category: id === 'cat'   ? 'all'        : prev.category,
      maxPrice:  id === 'price' ? 0            : prev.maxPrice,
      sortBy:    id === 'sort'  ? 'relevance'  : prev.sortBy,
    }));
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favIds.has(id), [favIds]);

  return {
    // state
    query, setQuery,
    filter, pendingFilter, setPending,
    viewMode, setViewMode,
    filterOpen,
    // data
    results,
    activeFilters,
    totalCount: products.length,
    // actions
    openFilter, closeFilter, applyFilter, resetFilter,
    clearAllFilters, removeFilter,
    toggleFavorite, isFavorite,
  };
}