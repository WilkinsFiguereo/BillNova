"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Search, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { AdminSidebar } from "../dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "../dashboard/data/adminNavigation.data";
import {
  apiDeleteModeratorProduct,
  apiListModeratorProducts,
  apiSetProductModerationStatus,
  apiUpdateModeratorProduct,
  type ModeratorProduct,
} from "@/features/moderator/data/moderatorApi";

type Notice = { type: "success" | "error"; message: string } | null;
type Filter = "todos" | "pending" | "approved" | "rejected";

type ProductFormState = {
  name: string;
  sku: string;
  price: string;
  cost: string;
  description: string;
  moderationStatus: "pending" | "approved" | "rejected";
  moderationReason: string;
};

const theme = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#1D4ED8",
  primarySoft: "#DBEAFE",
  success: "#15803D",
  successSoft: "#DCFCE7",
  warning: "#B45309",
  warningSoft: "#FEF3C7",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
};

function statusLabel(status: ModeratorProduct["moderationStatus"]): string {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

function statusColors(status: ModeratorProduct["moderationStatus"]) {
  if (status === "approved") return { color: theme.success, bg: theme.successSoft };
  if (status === "rejected") return { color: theme.danger, bg: theme.dangerSoft };
  return { color: theme.warning, bg: theme.warningSoft };
}

function toForm(product: ModeratorProduct): ProductFormState {
  return {
    name: product.name,
    sku: product.itemType === "product" ? product.sku : "",
    price: String(product.price ?? 0),
    cost: String(product.cost ?? 0),
    description: product.description ?? "",
    moderationStatus: product.moderationStatus,
    moderationReason: product.moderationReason ?? "",
  };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
}) {
  const commonStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 14,
    color: theme.text,
    background: disabled ? "#F8FAFC" : "#fff",
    outline: "none",
  };

  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: theme.muted, fontWeight: 700 }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={4}
          style={{ ...commonStyle, resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          disabled={disabled}
          style={commonStyle}
        />
      )}
    </label>
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 40 }} onClick={onClose} />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(680px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          overflow: "auto",
          background: "#fff",
          borderRadius: 20,
          border: `1px solid ${theme.border}`,
          boxShadow: "0 30px 80px rgba(15, 23, 42, 0.22)",
          padding: 24,
          zIndex: 41,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: theme.text }}>{title}</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 22 }}>
            x
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ModeratorProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [editingProduct, setEditingProduct] = useState<ModeratorProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ModeratorProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    sku: "",
    price: "0",
    cost: "0",
    description: "",
    moderationStatus: "pending",
    moderationReason: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await apiListModeratorProducts();
        if (mounted) setProducts(rows);
      } catch (error) {
        if (mounted) {
          setNotice({
            type: "error",
            message: error instanceof Error ? error.message : "No se pudieron cargar los productos.",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (filter !== "todos" && product.moderationStatus !== filter) return false;
      if (!q) return true;
      return [
        product.name,
        product.sku,
        product.companyName,
        product.categoryName,
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [products, search, filter]);

  const counters = useMemo(
    () => ({
      todos: products.length,
      pending: products.filter((product) => product.moderationStatus === "pending").length,
      approved: products.filter((product) => product.moderationStatus === "approved").length,
      rejected: products.filter((product) => product.moderationStatus === "rejected").length,
    }),
    [products],
  );

  const openEditModal = (product: ModeratorProduct) => {
    setEditingProduct(product);
    setForm(toForm(product));
  };

  const patchProduct = (productId: string, updater: (product: ModeratorProduct) => ModeratorProduct) => {
    setProducts((prev) => prev.map((product) => (product.id === productId ? updater(product) : product)));
  };

  const handleQuickModeration = async (product: ModeratorProduct, nextStatus: "approved" | "rejected") => {
    try {
      await apiSetProductModerationStatus(product.id, nextStatus, nextStatus === "rejected" ? product.moderationReason : "");
      patchProduct(product.id, (current) => ({
        ...current,
        moderationStatus: nextStatus,
        moderationReason: nextStatus === "rejected" ? current.moderationReason : undefined,
      }));
      setNotice({
        type: "success",
        message: `${product.name} fue ${nextStatus === "approved" ? "aprobado" : "rechazado"} correctamente.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar el estado del producto.",
      });
    }
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    if (!form.name.trim()) {
      setNotice({ type: "error", message: "El nombre del producto es requerido." });
      return;
    }

    try {
      setSaving(true);
      await apiUpdateModeratorProduct(editingProduct.id, {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
        description: form.description.trim(),
        moderationStatus: form.moderationStatus,
        moderationReason: form.moderationReason.trim(),
      });

      patchProduct(editingProduct.id, (current) => ({
        ...current,
        name: form.name.trim(),
        sku: editingProduct.itemType === "product" ? form.sku.trim() : current.sku,
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
        description: form.description.trim(),
        moderationStatus: form.moderationStatus,
        moderationReason: form.moderationReason.trim() || undefined,
      }));
      setEditingProduct(null);
      setNotice({ type: "success", message: "Producto actualizado correctamente." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar el producto.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setRemoving(true);
      await apiDeleteModeratorProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((product) => product.id !== deletingProduct.id));
      setDeletingProduct(null);
      setNotice({ type: "success", message: "Producto eliminado correctamente." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar el producto.",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, color: theme.text }}>
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 30 }}>Administrar productos y servicios</h1>
            <p style={{ margin: "8px 0 0", color: theme.muted }}>
              Edita informacion, aprueba o rechaza publicaciones y elimina registros desde un solo panel.
            </p>
          </div>

          {notice ? (
            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 12,
                background: notice.type === "success" ? theme.successSoft : theme.dangerSoft,
                color: notice.type === "success" ? theme.success : theme.danger,
                border: `1px solid ${notice.type === "success" ? "#86EFAC" : "#FCA5A5"}`,
              }}
            >
              {notice.message}
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            {(["todos", "pending", "approved", "rejected"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  textAlign: "left",
                  padding: 18,
                  borderRadius: 16,
                  border: filter === key ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`,
                  background: filter === key ? theme.primarySoft : theme.surface,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8, textTransform: "uppercase", fontWeight: 700 }}>
                  {key === "todos" ? "Todos" : statusLabel(key)}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{counters[key]}</div>
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Search size={18} color={theme.muted} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, SKU, empresa o categoria..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", color: theme.text }}
            />
          </div>

          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Publicacion", "Empresa", "Categoria", "Precio", "Estado", "Actualizado", "Acciones"].map((label) => (
                      <th
                        key={label}
                        style={{
                          textAlign: label === "Acciones" ? "right" : "left",
                          padding: "14px 16px",
                          fontSize: 12,
                          color: theme.muted,
                          textTransform: "uppercase",
                          borderBottom: `1px solid ${theme.border}`,
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 28, textAlign: "center", color: theme.muted }}>
                        Cargando publicaciones...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 28, textAlign: "center", color: theme.muted }}>
                        No se encontraron productos o servicios con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const statusStyle = statusColors(product.moderationStatus);
                      return (
                        <tr key={product.id}>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ fontWeight: 700 }}>{product.name}</div>
                            <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>
                              {product.itemType === "service" ? "Servicio" : `SKU: ${product.sku || "Sin SKU"}`}
                            </div>
                          </td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <div>{product.companyName || "Sin empresa"}</div>
                            <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>{product.companyEmail || "Sin correo"}</div>
                          </td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>{product.categoryName || "Sin categoria"}</td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ fontWeight: 700 }}>${product.price.toLocaleString()}</div>
                            <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>Costo: ${product.cost.toLocaleString()}</div>
                          </td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {statusLabel(product.moderationStatus)}
                            </span>
                          </td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, color: theme.muted, fontSize: 13 }}>
                            {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "Sin fecha"}
                          </td>
                          <td style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => openEditModal(product)}
                                style={{ border: `1px solid ${theme.border}`, background: "#fff", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => void handleQuickModeration(product, "approved")}
                                style={{ border: "none", background: theme.successSoft, color: theme.success, borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
                              >
                                <ShieldCheck size={15} />
                              </button>
                              <button
                                onClick={() => void handleQuickModeration(product, "rejected")}
                                style={{ border: "none", background: theme.warningSoft, color: theme.warning, borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
                              >
                                <ShieldX size={15} />
                              </button>
                              <button
                                onClick={() => setDeletingProduct(product)}
                                style={{ border: "none", background: theme.dangerSoft, color: theme.danger, borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Modal open={Boolean(editingProduct)} title="Editar publicacion" onClose={() => !saving && setEditingProduct(null)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
          <Field label="Nombre" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
          <Field
            label="SKU"
            value={form.sku}
            disabled={editingProduct?.itemType === "service"}
            onChange={(value) => setForm((prev) => ({ ...prev, sku: value }))}
          />
          <Field label="Precio" value={form.price} type="number" onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} />
          <Field label="Costo" value={form.cost} type="number" onChange={(value) => setForm((prev) => ({ ...prev, cost: value }))} />
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: theme.muted, fontWeight: 700 }}>Estado de moderacion</span>
            <select
              value={form.moderationStatus}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  moderationStatus: event.target.value as ProductFormState["moderationStatus"],
                }))
              }
              style={{ border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 12px", fontSize: 14 }}
            >
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </label>
          <Field
            label="Motivo de rechazo"
            value={form.moderationReason}
            onChange={(value) => setForm((prev) => ({ ...prev, moderationReason: value }))}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              label="Descripcion"
              value={form.description}
              onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
              multiline
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
          <button
            onClick={() => setEditingProduct(null)}
            disabled={saving}
            style={{ border: `1px solid ${theme.border}`, background: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            style={{ border: "none", background: theme.primary, color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(deletingProduct)} title="Eliminar publicacion" onClose={() => !removing && setDeletingProduct(null)}>
        <p style={{ margin: 0, color: theme.muted, lineHeight: 1.6 }}>
          {`Vas a eliminar ${deletingProduct?.name ?? "esta publicacion"}. Esta accion no se puede deshacer.`}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
          <button
            onClick={() => setDeletingProduct(null)}
            disabled={removing}
            style={{ border: `1px solid ${theme.border}`, background: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={removing}
            style={{ border: "none", background: theme.danger, color: "#fff", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
          >
            {removing ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
