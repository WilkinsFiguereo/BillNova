"use client";

import { odooRequest, odooGet, odooPut } from "@/lib/odooApi";

type AnyObj = Record<string, any>;

function unwrapArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  return [];
}

export interface ModeratorProduct {
  id: string;
  name: string;
  sku: string;
  companyId: string;
  companyName: string;
  companyEmail: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  moderationStatus: "pending" | "approved" | "rejected";
  moderationReason?: string;
  updatedAt: string;
}

function normalizeModeratorProductStatus(value: unknown): ModeratorProduct["moderationStatus"] {
  return value === "approved" || value === "rejected" || value === "pending" ? value : "pending";
}

export interface ModeratorUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ModeratorReview {
  reviewId: string;
  productId: string;
  author: string;
  comment: string;
  rating: number;
  date: string;
}

export interface ModeratorProductReviewStats {
  productId: string;
  averageRating: number | null;
  totalReviews: number;
  distribution: Array<{ estrellas: number; cantidad: number }>;
}

export interface ModeratorCompany {
  id: string;
  name: string;
  taxId: string;
  type: string;
  country: string;
  city: string;
  representative: string;
  email: string;
  phone: string;
  website: string;
  employees: string;
  description: string;
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  avatarColor: string;
  documents: Array<{ name: string; type: "Tax ID" | "Incorporation" | "Chamber" | "Other"; uploaded: boolean }>;
}

export interface ModeratorPosOrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceUnit: number;
}

export interface ModeratorPosOrder {
  id: string;
  reference: string;
  date: string;
  status: string;
  total: number;
  lines: ModeratorPosOrderLine[];
}

export interface ModeratorReport {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: "otro";
  estado: "pendiente" | "en_proceso" | "solucionado" | "rechazado" | "cerrado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
  };
  pedido?: {
    id: string;
    numero: string;
    fecha: string;
    productos: Array<{
      id: string;
      nombre: string;
      sku: string;
      precio: number;
    }>;
    total: number;
  };
  fechaCreacion: string;
  fechaActualizacion: string;
  imagenes?: string[];
  notasModerador?: string;
  historial: Array<{
    id: string;
    fecha: string;
    estadoAnterior: "pendiente" | "en_proceso" | "solucionado" | "rechazado" | "cerrado";
    estadoNuevo: "pendiente" | "en_proceso" | "solucionado" | "rechazado" | "cerrado";
    moderador: string;
    nota?: string;
  }>;
}

function companySizeLabel(size: string): string {
  const map: Record<string, string> = {
    micro: "1-10",
    small: "10-50",
    medium: "50-200",
    large: "200+",
  };
  return map[size] ?? "N/D";
}

function companyTypeLabel(sector: string): string {
  const normalized = sector.trim();
  if (!normalized) return "Services";
  return normalized;
}

function avatarColorFromId(id: string): string {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#14B8A6", "#EC4899"];
  const num = Number(String(id).replace(/\D/g, "")) || 0;
  return colors[num % colors.length];
}

export async function apiListModeratorProducts(): Promise<ModeratorProduct[]> {
  const payload = await odooRequest<any>("/api/products", { method: "GET" });
  const rows = unwrapArray(payload);
  return rows.map((r: AnyObj) => ({
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    sku: String(r.default_code ?? ""),
    companyId: String(r.company_id ?? ""),
    companyName: String(r.company_name ?? ""),
    companyEmail: String(r.company_email ?? ""),
    categoryId: String(r.category_id ?? ""),
    categoryName: String(r.category_name ?? ""),
    price: Number(r.list_price ?? 0),
    cost: Number(r.standard_price ?? 0),
    stock: Number(r.qty_available ?? 0),
    description: String(r.description_sale ?? ""),
    moderationStatus: normalizeModeratorProductStatus(r.moderation_status),
    moderationReason: r.moderation_reason ? String(r.moderation_reason) : undefined,
    updatedAt: String(r.moderation_updated_at ?? r.write_date ?? r.create_date ?? ""),
  }));
}

export async function apiSetProductModerationStatus(
  productId: string,
  status: "pending" | "approved" | "rejected",
  reason?: string,
): Promise<void> {
  await odooRequest(`/api/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify({
      moderation_status: status,
      moderation_reason: reason ?? "",
    }),
  });
}

export async function apiListModeratorUsers(): Promise<ModeratorUser[]> {
  const [usersPayload, bnPayload] = await Promise.all([
    odooRequest<any>("/api/users", { method: "GET" }),
    odooRequest<any>("/api/billnova-users", { method: "GET" }),
  ]);

  const users = unwrapArray(usersPayload);
  const bn = unwrapArray(bnPayload);
  const roleByResUserId = new Map<string, string>();
  for (const row of bn) roleByResUserId.set(String(row.res_user_id ?? ""), String(row.role ?? ""));

  return users.map((u: AnyObj) => ({
    id: String(u.id ?? ""),
    name: String(u.name ?? "Usuario"),
    email: String(u.email ?? ""),
    role: roleByResUserId.get(String(u.id ?? "")) ?? undefined,
  }));
}

export async function apiListRecentReviewsFromProducts(productIds: string[]): Promise<ModeratorReview[]> {
  const tasks = productIds.slice(0, 10).map(async (productId) => {
    try {
      const payload = await odooRequest<any>(`/api/products/${encodeURIComponent(productId)}/reviews`, { method: "GET" });
      const reviews = unwrapArray(payload);
      return reviews.slice(0, 3).map((r: AnyObj) => ({
        reviewId: String(r.review_id ?? ""),
        productId,
        author: String(r.author ?? "Anon"),
        comment: String(r.comment ?? ""),
        rating: Number(r.rating ?? 0),
        date: String(r.date ?? ""),
      }));
    } catch {
      return [];
    }
  });
  const list = await Promise.all(tasks);
  return list.flat();
}

export async function apiListProductReviewStats(productIds: string[]): Promise<Map<string, ModeratorProductReviewStats>> {
  const statsMap = new Map<string, ModeratorProductReviewStats>();

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const payload = await odooRequest<any>(`/api/products/${encodeURIComponent(productId)}/reviews`, { method: "GET" });
        const stats = payload?.stats ?? {};
        const distributionRaw = stats.distribution ?? {};
        statsMap.set(productId, {
          productId,
          averageRating:
            typeof stats.avg === "number" && stats.total > 0 ? Number(stats.avg) : null,
          totalReviews: Number(payload?.total_reviews ?? stats.total ?? 0),
          distribution: [5, 4, 3, 2, 1].map((estrellas) => ({
            estrellas,
            cantidad: Number(distributionRaw[String(estrellas)] ?? 0),
          })),
        });
      } catch {
        statsMap.set(productId, {
          productId,
          averageRating: null,
          totalReviews: 0,
          distribution: [5, 4, 3, 2, 1].map((estrellas) => ({ estrellas, cantidad: 0 })),
        });
      }
    }),
  );

  return statsMap;
}

export async function apiListModeratorCompanies(): Promise<ModeratorCompany[]> {
  const payload = await odooRequest<any>("/api/companies", { method: "GET" });
  const rows = unwrapArray(payload);

  return rows.map((row: AnyObj) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? "Empresa"),
    taxId: String(row.ruc ?? ""),
    type: companyTypeLabel(String(row.sector ?? "")),
    country: String(row.country_name ?? "Sin pais"),
    city: String(row.address_city ?? "Sin ciudad"),
    representative: String(row.admin_full_name || row.contact_name || "Sin representante"),
    email: String(row.admin_email || row.contact_email || ""),
    phone: String(row.admin_phone || row.contact_phone || ""),
    website: String(row.website ?? ""),
    employees: companySizeLabel(String(row.company_size ?? "")),
    description: String(row.full_address || row.address_state || "Empresa registrada en BillNova"),
    registeredAt: String(row.create_date ?? row.write_date ?? new Date().toISOString()),
    status: (row.moderation_status ?? "pending") as ModeratorCompany["status"],
    rejectionReason: row.moderation_reason ? String(row.moderation_reason) : undefined,
    avatarColor: avatarColorFromId(String(row.id ?? "")),
    documents: [
      { name: "Tax ID Registration", type: "Tax ID", uploaded: Boolean(row.ruc) },
      { name: "Company Contact", type: "Other", uploaded: Boolean(row.contact_email || row.admin_email) },
      { name: "Address", type: "Other", uploaded: Boolean(row.full_address || row.address_city) },
    ],
  }));
}

export async function apiSetCompanyModerationStatus(
  companyId: string,
  status: "pending" | "approved" | "rejected",
  reason?: string,
): Promise<void> {
  await odooRequest(`/api/companies/${encodeURIComponent(companyId)}`, {
    method: "PUT",
    body: JSON.stringify({
      moderation_status: status,
      moderation_reason: reason ?? "",
    }),
  });
}

export async function apiListModeratorPosOrders(): Promise<ModeratorPosOrder[]> {
  const payload = await odooRequest<any>("/api/pos/orders", { method: "GET" });
  const rows = unwrapArray(payload);

  return rows.map((row: AnyObj) => ({
    id: String(row.id ?? ""),
    reference: String(row.reference ?? ""),
    date: String(row.date ?? ""),
    status: String(row.status ?? ""),
    total: Number(row.total ?? 0),
    lines: Array.isArray(row.lines)
      ? row.lines.map((line: AnyObj) => ({
          id: String(line.id ?? ""),
          productId: String(line.productId ?? line.product_id ?? ""),
          productName: String(line.productName ?? line.product_name ?? ""),
          quantity: Number(line.quantity ?? 0),
          priceUnit: Number(line.priceUnit ?? line.price_unit ?? 0),
        }))
      : [],
  }));
}

export async function apiListModeratorReports(): Promise<ModeratorReport[]> {
  const payload = await odooRequest<any>("/api/moderation/reports", { method: "GET" });
  return unwrapArray(payload) as ModeratorReport[];
}

export async function apiUpdateModeratorReport(
  reportId: string,
  payload: { estado?: ModeratorReport["estado"]; nota?: string; notasModerador?: string },
): Promise<ModeratorReport> {
  const res = await odooRequest<any>(`/api/moderation/reports/${encodeURIComponent(reportId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data as ModeratorReport;
}
