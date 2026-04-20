// src/features/seller/category/hooks/useCategorias.ts

import { useState, useEffect, useCallback } from 'react';
import { categoriasService } from '../data/categoriasService';
import {
  Category,
  CategoryFilters,
  CategoryStats,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryModalMode,
} from '../types';

export function useCategorias() {
  // ==================== ESTADO ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalProducts: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y búsqueda
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    isActive: null, // null = mostrar todos
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: CategoryModalMode;
    editingCategory?: Category;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // ==================== CARGAR DATOS ====================
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [data, statsData] = await Promise.all([
        categoriasService.getAll(),
        categoriasService.getStats(),
      ]);

      setCategories(data);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el hook
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ==================== CRUD ====================
  const createCategory = async (data: CreateCategoryDTO) => {
    try {
      setError(null);
      const newCategory = await categoriasService.create(data);
      
      setCategories(prev => [newCategory, ...prev]);
      await refreshStats();
      
      closeModal();
      return newCategory;
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
      throw err;
    }
  };

  const updateCategory = async (data: UpdateCategoryDTO) => {
    try {
      setError(null);
      const updatedCategory = await categoriasService.update(data);
      
      setCategories(prev =>
        prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
      );
      
      await refreshStats();
      closeModal();
      return updatedCategory;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la categoría');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await categoriasService.delete(id);
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la categoría');
      throw err;
    }
  };

  const toggleActive = async (id: string) => {
    try {
      setError(null);
      const updatedCategory = await categoriasService.toggleActive(id);
      
      setCategories(prev =>
        prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
      );
      
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
      throw err;
    }
  };

  // ==================== STATS ====================
  const refreshStats = async () => {
    try {
      const statsData = await categoriasService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error al actualizar estadísticas', err);
    }
  };

  // ==================== MODAL ====================
  const openModal = (mode: CategoryModalMode, category?: Category) => {
    setModalState({
      isOpen: true,
      mode,
      editingCategory: category,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingCategory: undefined,
    });
  };

  // ==================== FILTROS Y BÚSQUEDA ====================
  const setFilter = (newFilters: Partial<CategoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Filtrado y ordenamiento en cliente (para mock data)
  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesActive =
        filters.isActive === null || category.isActive === filters.isActive;

      return matchesSearch && matchesActive;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * order;
        case 'productCount':
          return (a.productCount - b.productCount) * order;
        case 'createdAt':
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order
          );
        case 'updatedAt':
        default:
          return (
            (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order
          );
      }
    });

  // ==================== RETURN ====================
  return {
    // Datos
    categories: filteredCategories,
    allCategories: categories, // útil para algunos casos
    stats,
    isLoading,
    error,

    // CRUD
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive,

    // Filtros
    filters,
    setFilters: setFilter,
    searchTerm,
    setSearchTerm,

    // Modal
    openModal,
    closeModal,
    modalState,

    // Utils
    refresh: loadCategories,
  };
}