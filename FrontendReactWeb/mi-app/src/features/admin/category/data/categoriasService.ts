import { odooDelete, odooGet, odooPost, odooPut } from "@/lib/odooApi";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import type { Category, CategoryStats, CreateCategoryDTO, UpdateCategoryDTO } from "../types";

type CategoryApiRecord = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  product_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type CategoryEnvelope = {
  ok: boolean;
  data?: CategoryApiRecord[];
  error?: string;
};

type SingleCategoryEnvelope = {
  ok: boolean;
  data?: CategoryApiRecord;
  error?: string;
};

function sessionToken() {
  return getStoredAuthState()?.sessionToken;
}

function mapCategory(record: CategoryApiRecord): Category {
  return {
    id: String(record.id),
    name: record.name ?? "",
    description: record.description ?? "",
    color: record.color ?? "#1E3A8A",
    icon: record.icon ?? "Package",
    isActive: record.is_active !== false,
    productCount: record.product_count ?? 0,
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? new Date().toISOString(),
  };
}

async function getAllInternal(): Promise<Category[]> {
  const response = await odooGet<CategoryEnvelope>("/api/categories", {
    sessionToken: sessionToken(),
    allowedStatuses: [401, 403, 404, 409],
  });
  if (!response.ok) {
    throw new Error(response.error ?? "No se pudieron cargar las categorias");
  }
  return (response.data ?? []).map(mapCategory);
}

export const categoriasService = {
  async getAll(): Promise<Category[]> {
    const categories = await getAllInternal();
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Category | null> {
    const categories = await getAllInternal();
    return categories.find((category) => category.id === id) ?? null;
  },

  async create(data: CreateCategoryDTO): Promise<Category> {
    const response = await odooPost<SingleCategoryEnvelope>(
      "/api/categories",
      {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        is_active: data.isActive ?? true,
      },
      {
        sessionToken: sessionToken(),
        allowedStatuses: [400, 401, 403, 404, 409],
      },
    );
    if (!response.ok || !response.data) {
      throw new Error(response.error ?? "No se pudo crear la categoria");
    }
    return mapCategory(response.data);
  },

  async update(data: UpdateCategoryDTO): Promise<Category> {
    const response = await odooPut<SingleCategoryEnvelope>(
      `/api/categories/${encodeURIComponent(data.id)}`,
      {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        is_active: data.isActive,
      },
      {
        sessionToken: sessionToken(),
        allowedStatuses: [400, 401, 403, 404, 409],
      },
    );
    if (!response.ok || !response.data) {
      throw new Error(response.error ?? "No se pudo actualizar la categoria");
    }
    return mapCategory(response.data);
  },

  async delete(id: string): Promise<void> {
    const response = await odooDelete<{ ok: boolean; error?: string }>(
      `/api/categories/${encodeURIComponent(id)}`,
      {
        sessionToken: sessionToken(),
        allowedStatuses: [400, 401, 403, 404, 409],
      },
    );
    if (!response.ok) {
      throw new Error(response.error ?? "No se pudo eliminar la categoria");
    }
  },

  async toggleActive(id: string): Promise<Category> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Categoria no encontrada");
    }
    return this.update({
      id,
      isActive: !existing.isActive,
      name: existing.name,
      description: existing.description,
      color: existing.color,
      icon: existing.icon,
    });
  },

  async getStats(): Promise<CategoryStats> {
    const categories = await getAllInternal();
    const total = categories.length;
    const active = categories.filter((category) => category.isActive).length;
    const inactive = total - active;
    const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0);
    return { total, active, inactive, totalProducts };
  },
};
