"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminSidebar } from "../dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "../dashboard/data/adminNavigation.data";
import { Modal } from "../users/ui/Modal";
import { colors, font, radius } from "../users/theme/tokens";

type ProductStatus = "pending" | "approved" | "rejected";

type ProductItem = {
  id: number;
  name: string;
  default_code?: string | null;
  list_price?: number;
  standard_price?: number;
  qty_available?: number;
  description?: string;
  category_name?: string | null;
  company_id?: number | null;
  company_name?: string | null;
  moderation_status?: ProductStatus;
  rejection_reason?: string;
  created_at?: string | null;
};

type CompanyOption = {
  id: number;
  name: string;
  active?: boolean;
};

type ProductFormState = {
  name: string;
  default_code: string;
  list_price: string;
  standard_price: string;
  description: string;
  company_id: string;
};

const emptyForm: ProductFormState = {
  name: "",
  default_code: "",
  list_price: "",
  standard_price: "",
  description: "",
  company_id: "",
};

const statusStyles: Record<ProductStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pendiente", bg: colors.warningSoft, color: colors.warning },
  approved: { label: "Aprobado", bg: colors.successSoft, color: colors.success },
  rejected: { label: "Rechazado", bg: colors.errorSoft, color: colors.error },
};

function formatMoney(value?: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function buildProductPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    default_code: form.default_code.trim() || null,
    list_price: Number(form.list_price || 0),
    standard_price: Number(form.standard_price || 0),
    description: form.description.trim(),
    company_id: Number(form.company_id),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | ProductStatus>("todos");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingProduct, setRejectingProduct] = useState<ProductItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setPageError(null);

      const [productsResponse, companiesResponse] = await Promise.all([
        fetch("/api/proxy/api/products", { cache: "no-store" }),
        fetch("/api/companies", { cache: "no-store" }),
      ]);

      const productsPayload = await productsResponse.json().catch(() => null);
      const companiesPayload = await companiesResponse.json().catch(() => null);

      if (!productsResponse.ok) {
        throw new Error(productsPayload?.error || productsPayload?.details || "No se pudieron cargar los productos.");
      }
      if (!companiesResponse.ok) {
        throw new Error(companiesPayload?.error || companiesPayload?.details || "No se pudieron cargar las empresas.");
      }

      const loadedProducts = (productsPayload?.data || []) as ProductItem[];
      const loadedCompanies = ((companiesPayload?.data || companiesPayload?.companies || []) as CompanyOption[]).filter(
        (company) => company.active !== false,
      );

      setProducts(loadedProducts);
      setCompanies(loadedCompanies);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudieron cargar los datos del admin.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStatus = statusFilter === "todos" || (product.moderation_status || "pending") === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.default_code || "").toLowerCase().includes(q) ||
        (product.company_name || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [products, search, statusFilter]);

  const counters = useMemo(
    () => ({
      todos: products.length,
      pending: products.filter((product) => (product.moderation_status || "pending") === "pending").length,
      approved: products.filter((product) => (product.moderation_status || "pending") === "approved").length,
      rejected: products.filter((product) => (product.moderation_status || "pending") === "rejected").length,
    }),
    [products],
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      default_code: product.default_code || "",
      list_price: String(product.list_price ?? ""),
      standard_price: String(product.standard_price ?? ""),
      description: product.description || "",
      company_id: product.company_id ? String(product.company_id) : "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const submitForm = async () => {
    try {
      if (!form.name.trim()) throw new Error("El nombre del producto es obligatorio.");
      if (!form.company_id) throw new Error("Debes seleccionar una compania.");

      setIsSubmitting(true);
      setFormError(null);

      const response = await fetch(
        editingProduct ? `/api/proxy/api/products/${editingProduct.id}` : "/api/proxy/api/products/create",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildProductPayload(form)),
        },
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || payload?.details || "No se pudo guardar el producto.");
      }

      await loadData();
      closeFormModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProductStatus = async (product: ProductItem, status: ProductStatus, reason = "") => {
    const response = await fetch(`/api/proxy/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moderation_status: status,
        rejection_reason: reason,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || payload?.details || "No se pudo actualizar el estado del producto.");
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              moderation_status: status,
              rejection_reason: reason,
            }
          : item,
      ),
    );
    setSelectedProduct((prev) =>
      prev?.id === product.id
        ? {
            ...prev,
            moderation_status: status,
            rejection_reason: reason,
          }
        : prev,
    );
  };

  const handleDelete = async (product: ProductItem) => {
    const confirmed = window.confirm(`Eliminar "${product.name}"?`);
    if (!confirmed) return;

    try {
      setPageError(null);
      const response = await fetch(`/api/proxy/api/products/${product.id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || payload?.details || "No se pudo eliminar el producto.");
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg.primary,
        color: colors.text.primary,
        fontFamily: font.family,
      }}
    >
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px 36px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: font.sizes["2xl"], fontWeight: font.weights.bold }}>
                Productos
              </h1>
              <p style={{ margin: "8px 0 0", color: colors.text.secondary }}>
                El admin puede crear, editar, aprobar, rechazar y eliminar productos con compania real.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                borderRadius: radius.md,
                border: "none",
                background: colors.accent,
                color: "#fff",
                fontWeight: font.weights.semibold,
                cursor: "pointer",
              }}
            >
              <Plus size={16} />
              Nuevo producto
            </button>
          </div>

          {pageError && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 14px",
                borderRadius: radius.md,
                background: colors.errorSoft,
                color: colors.error,
                border: `1px solid ${colors.error}55`,
              }}
            >
              {pageError}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 22 }}>
            {([
              ["todos", "Todos"],
              ["pending", "Pendientes"],
              ["approved", "Aprobados"],
              ["rejected", "Rechazados"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  textAlign: "left",
                  padding: "16px 18px",
                  borderRadius: radius.lg,
                  border: `1px solid ${statusFilter === key ? colors.accent : colors.border}`,
                  background: statusFilter === key ? colors.primarySoft : colors.bg.secondary,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: font.sizes.sm, color: colors.text.tertiary, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: colors.text.primary }}>
                  {counters[key]}
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, SKU o compania..."
              style={{
                flex: 1,
                minWidth: 260,
                padding: "12px 14px",
                borderRadius: radius.md,
                border: `1px solid ${colors.border}`,
                background: colors.bg.secondary,
                color: colors.text.primary,
              }}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "todos" | ProductStatus)}
              style={{
                padding: "12px 14px",
                borderRadius: radius.md,
                border: `1px solid ${colors.border}`,
                background: colors.bg.secondary,
                color: colors.text.primary,
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>

          <div
            style={{
              background: colors.bg.secondary,
              borderRadius: radius.lg,
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <div style={{ padding: 32, color: colors.text.secondary }}>Cargando productos...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: 32, color: colors.text.secondary }}>No se encontraron productos.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: colors.bg.primary }}>
                      {["Producto", "Compania", "Precio", "Costo", "Estado", "Acciones"].map((label) => (
                        <th
                          key={label}
                          style={{
                            padding: "14px",
                            textAlign: label === "Acciones" ? "right" : "left",
                            fontSize: font.sizes.sm,
                            color: colors.text.tertiary,
                            textTransform: "uppercase",
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const status = statusStyles[product.moderation_status || "pending"];
                      return (
                        <tr key={product.id}>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}` }}>
                            <div style={{ fontWeight: 600 }}>{product.name}</div>
                            <div style={{ fontSize: font.sizes.sm, color: colors.text.tertiary, marginTop: 2 }}>
                              {product.default_code || `SKU-${product.id}`}
                            </div>
                          </td>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}`, color: colors.text.secondary }}>
                            {product.company_name || "Sin compania"}
                          </td>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}` }}>
                            {formatMoney(product.list_price)}
                          </td>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}` }}>
                            {formatMoney(product.standard_price)}
                          </td>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}` }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: status.bg,
                                color: status.color,
                                fontSize: font.sizes.sm,
                                fontWeight: 600,
                              }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px", borderBottom: `1px solid ${colors.border}`, textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setSelectedProduct(product)}
                                style={secondaryButtonStyle}
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                style={secondaryButtonStyle}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => updateProductStatus(product, "approved")}
                                style={successButtonStyle}
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingProduct(product);
                                  setRejectionReason(product.rejection_reason || "");
                                }}
                                style={warningButtonStyle}
                              >
                                Rechazar
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                style={dangerButtonStyle}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal
        open={isFormOpen}
        onClose={closeFormModal}
        title={editingProduct ? "Editar producto" : "Crear producto"}
        width={760}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nombre del producto"
            style={inputStyle}
          />
          <input
            value={form.default_code}
            onChange={(event) => setForm((prev) => ({ ...prev, default_code: event.target.value }))}
            placeholder="SKU"
            style={inputStyle}
          />
          <input
            value={form.list_price}
            onChange={(event) => setForm((prev) => ({ ...prev, list_price: event.target.value }))}
            placeholder="Precio de venta"
            type="number"
            min="0"
            step="0.01"
            style={inputStyle}
          />
          <input
            value={form.standard_price}
            onChange={(event) => setForm((prev) => ({ ...prev, standard_price: event.target.value }))}
            placeholder="Costo"
            type="number"
            min="0"
            step="0.01"
            style={inputStyle}
          />
          <select
            value={form.company_id}
            onChange={(event) => setForm((prev) => ({ ...prev, company_id: event.target.value }))}
            style={inputStyle}
          >
            <option value="">Selecciona una compania</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: radius.md,
              border: `1px solid ${colors.border}`,
              background: colors.bg.primary,
              color: colors.text.secondary,
              fontSize: font.sizes.sm,
              display: "flex",
              alignItems: "center",
            }}
          >
            La compania es obligatoria para crear y editar desde admin.
          </div>
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descripcion"
            rows={5}
            style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" }}
          />
        </div>

        {formError && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: radius.md,
              background: colors.errorSoft,
              color: colors.error,
              border: `1px solid ${colors.error}55`,
            }}
          >
            {formError}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button onClick={closeFormModal} style={secondaryButtonStyle}>
            Cancelar
          </button>
          <button
            onClick={submitForm}
            disabled={isSubmitting}
            style={{
              ...primaryButtonStyle,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "wait" : "pointer",
            }}
          >
            {isSubmitting ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || "Detalle de producto"}
        width={720}
      >
        {selectedProduct && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {[
              ["SKU", selectedProduct.default_code || `SKU-${selectedProduct.id}`],
              ["Compania", selectedProduct.company_name || "Sin compania"],
              ["Precio", formatMoney(selectedProduct.list_price)],
              ["Costo", formatMoney(selectedProduct.standard_price)],
              ["Estado", statusStyles[selectedProduct.moderation_status || "pending"].label],
              ["Creado", selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleString("es-DO") : "-"],
            ].map(([label, value]) => (
              <div key={label} style={detailCardStyle}>
                <div style={{ fontSize: font.sizes.sm, color: colors.text.tertiary, marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{value}</div>
              </div>
            ))}
            <div style={{ ...detailCardStyle, gridColumn: "1 / -1" }}>
              <div style={{ fontSize: font.sizes.sm, color: colors.text.tertiary, marginBottom: 4 }}>Descripcion</div>
              <div>{selectedProduct.description || "Sin descripcion"}</div>
            </div>
            {selectedProduct.rejection_reason && (
              <div style={{ ...detailCardStyle, gridColumn: "1 / -1", border: `1px solid ${colors.error}55`, background: colors.errorSoft }}>
                <div style={{ fontSize: font.sizes.sm, color: colors.error, marginBottom: 4 }}>Motivo de rechazo</div>
                <div style={{ color: colors.text.primary }}>{selectedProduct.rejection_reason}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(rejectingProduct)}
        onClose={() => {
          setRejectingProduct(null);
          setRejectionReason("");
        }}
        title="Rechazar producto"
        width={560}
      >
        <div style={{ color: colors.text.secondary, marginBottom: 12 }}>
          {rejectingProduct ? `Indica el motivo de rechazo para "${rejectingProduct.name}".` : ""}
        </div>
        <textarea
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          rows={5}
          style={{ ...inputStyle, width: "100%", resize: "vertical" }}
          placeholder="Motivo de rechazo"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => {
              setRejectingProduct(null);
              setRejectionReason("");
            }}
            style={secondaryButtonStyle}
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!rejectingProduct) return;
              try {
                await updateProductStatus(
                  rejectingProduct,
                  "rejected",
                  rejectionReason.trim() || "Sin motivo especificado",
                );
                setRejectingProduct(null);
                setRejectionReason("");
              } catch (error) {
                setPageError(error instanceof Error ? error.message : "No se pudo rechazar el producto.");
              }
            }}
            style={dangerButtonStyle}
          >
            Confirmar rechazo
          </button>
        </div>
      </Modal>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  background: colors.bg.primary,
  color: colors.text.primary,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: radius.md,
  border: "none",
  background: colors.accent,
  color: "#fff",
  fontWeight: font.weights.semibold,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  background: "transparent",
  color: colors.text.secondary,
  cursor: "pointer",
};

const successButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: radius.md,
  border: "none",
  background: colors.success,
  color: "#fff",
  cursor: "pointer",
};

const warningButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: radius.md,
  border: "none",
  background: colors.warning,
  color: "#fff",
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: radius.md,
  border: "none",
  background: colors.error,
  color: "#fff",
  cursor: "pointer",
};

const detailCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  background: colors.bg.primary,
};
