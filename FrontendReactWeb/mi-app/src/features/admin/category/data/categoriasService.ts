// src/features/seller/category/data/categoriasService.ts

import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types';

let categories: Category[] = [
  {
    id: 'cat-001',
    name: 'Electrónicos',
    description: 'Dispositivos electrónicos, celulares, computadoras y accesorios',
    color: '#1E3A8A',
    icon: 'Laptop',
    isActive: true,
    productCount: 124,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2026-04-10T14:20:00Z',
  },
  {
    id: 'cat-002',
    name: 'Ropa y Moda',
    description: 'Prendas de vestir, calzado y accesorios de moda',
    color: '#3B82F6',
    icon: 'Shirt',
    isActive: true,
    productCount: 87,
    createdAt: '2025-02-03T09:15:00Z',
    updatedAt: '2026-04-18T11:45:00Z',
  },
  {
    id: 'cat-003',
    name: 'Hogar y Cocina',
    description: 'Muebles, utensilios y artículos para el hogar',
    color: '#10B981',
    icon: 'Home',
    isActive: true,
    productCount: 56,
    createdAt: '2025-03-20T16:40:00Z',
    updatedAt: '2026-04-05T08:30:00Z',
  },
  {
    id: 'cat-004',
    name: 'Belleza y Cuidado Personal',
    description: 'Productos de cosmética, skincare y cuidado personal',
    color: '#F59E0B',
    icon: 'Sparkles',
    isActive: false,
    productCount: 34,
    createdAt: '2025-06-12T12:00:00Z',
    updatedAt: '2026-03-28T10:15:00Z',
  },
  {
    id: 'cat-005',
    name: 'Deportes y Fitness',
    description: 'Equipos deportivos, ropa deportiva y suplementos',
    color: '#EF4444',
    icon: 'Dumbbell',
    isActive: true,
    productCount: 42,
    createdAt: '2025-08-05T14:25:00Z',
    updatedAt: '2026-04-15T09:50:00Z',
  },
];

// Simula delay de red (para desarrollo realista)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const categoriasService = {
  // ==================== GET ALL ====================
  async getAll(): Promise<Category[]> {
    await delay(400);
    return [...categories].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // ==================== GET BY ID ====================
  async getById(id: string): Promise<Category | null> {
    await delay(200);
    return categories.find(cat => cat.id === id) || null;
  },

  // ==================== CREATE ====================
  async create(data: CreateCategoryDTO): Promise<Category> {
    await delay(500);

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      description: data.description?.trim(),
      color: data.color,
      icon: data.icon,
      isActive: data.isActive ?? true,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categories.unshift(newCategory); // Agregar al inicio
    return newCategory;
  },

  // ==================== UPDATE ====================
  async update(data: UpdateCategoryDTO): Promise<Category> {
    await delay(500);

    const index = categories.findIndex(cat => cat.id === data.id);
    if (index === -1) {
      throw new Error('Categoría no encontrada');
    }

    const updatedCategory: Category = {
      ...categories[index],
      ...data,
      name: data.name?.trim() ?? categories[index].name,
      description: data.description?.trim(),
      updatedAt: new Date().toISOString(),
    };

    categories[index] = updatedCategory;
    return updatedCategory;
  },

  // ==================== DELETE ====================
  async delete(id: string): Promise<void> {
    await delay(400);

    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Categoría no encontrada');
    }

    // Validación: No permitir eliminar si tiene productos
    if (categories[index].productCount > 0) {
      throw new Error('No se puede eliminar una categoría que tiene productos asociados');
    }

    categories.splice(index, 1);
  },

  // ==================== TOGGLE ACTIVE ====================
  async toggleActive(id: string): Promise<Category> {
    await delay(300);

    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Categoría no encontrada');
    }

    categories[index].isActive = !categories[index].isActive;
    categories[index].updatedAt = new Date().toISOString();

    return categories[index];
  },

  // ==================== GET STATS ====================
  async getStats() {
    await delay(200);

    const total = categories.length;
    const active = categories.filter(c => c.isActive).length;
    const inactive = total - active;
    const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

    return {
      total,
      active,
      inactive,
      totalProducts,
    };
  },
};