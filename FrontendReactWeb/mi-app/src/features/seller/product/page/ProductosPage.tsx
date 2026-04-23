"use client";

import React, { useEffect, useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { productosTheme as t, globalStyles } from "../theme/productos.theme";
import { Toast } from "../ui/ProductoCard";
import { ProductosHeaderSection } from "../sections/ProductosHeaderSection";
import { ProductosStatsSection } from "../sections/ProductosStatsSection";
import { ProductosTableSection } from "../sections/ProductosTableSection";
import { Modal } from "@/features/admin/users/ui/Modal";
import type { Producto } from "../types/productos.types";

import { Sidebar } from "../../dashboard/dashboards";
import { NAV_ITEMS } from "../../dashboard/data/chart.data";
import { apiListCategorias } from "../data/productApi";

const defaultForm: Partial<Producto> = {
  nombre: "",
  sku: "",
  categoria: "Electronica",
  stock: 0,
  precio: 0,
  costo: 0,
  proveedor: "",
  imageDataUrl: "",
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export default function ProductosPage() {
  const {
    productos,
    loading,
    error,
    search,
    categoriaActiva,
    vistaMode,
    ordenCampo,
    ordenDir,
    toastVisible,
    toastMsg,
    productosFiltrados,
    setSearch,
    setCategoriaActiva,
    setVistaMode,
    toggleOrden,
    showToast,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    refreshProductos,
  } = useProductos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [formValues, setFormValues] = useState<Partial<Producto>>(defaultForm);
  const [odooCategories, setOdooCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    apiListCategorias()
      .then(setOdooCategories)
      .catch(() => setOdooCategories([]));
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setFormValues(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Producto) => {
    setModalMode("edit");
    setSelectedProduct(p);
    setFormValues({
      nombre: p.nombre,
      sku: p.sku,
      categoria: p.categoria,
      stock: p.stock,
      precio: p.precio,
      costo: p.costo,
      proveedor: p.proveedor,
      imageDataUrl: p.imageUrl ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormValues(defaultForm);
  };

  const exportCSV = () => {
    const headers = ["ID", "Nombre", "SKU", "Categoria", "Stock", "Precio", "Costo", "Margen", "Proveedor", "Ultima actualizacion"];
    const rows = productosFiltrados.map((p) => {
      const margen = p.precio !== 0 ? ((p.precio - p.costo) / p.precio) * 100 : 0;
      return [
        p.id,
        p.nombre,
        p.sku,
        p.categoria,
        String(p.stock),
        p.precio.toFixed(2),
        p.costo.toFixed(2),
        `${margen.toFixed(2)}%`,
        p.proveedor,
        p.ultimaActualizacion,
      ];
    });

    const content = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "productos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormValues((prev) => ({ ...prev, imageDataUrl: dataUrl }));
    } catch (error: any) {
      showToast(error?.message ?? "No se pudo cargar la imagen.");
    }
  };

  const guardaryCerrar = async () => {
    if (!formValues.nombre?.trim()) {
      showToast("El nombre del producto es obligatorio");
      return;
    }

    const payload: Partial<Producto> = {
      nombre: formValues.nombre,
      sku: formValues.sku || "",
      precio: Number(formValues.precio ?? 0),
      costo: Number(formValues.costo ?? 0),
      stock: Number(formValues.stock ?? 0),
      categoria: formValues.categoria || "Electronica",
      proveedor: formValues.proveedor || "",
      imageDataUrl: String(formValues.imageDataUrl ?? ""),
    };

    try {
      if (modalMode === "create") {
        await crearProducto(payload);
        showToast("Producto creado correctamente");
      } else if (modalMode === "edit" && selectedProduct) {
        await actualizarProducto(selectedProduct.id, payload);
        showToast("Producto actualizado correctamente");
      }
      await refreshProductos();
      closeModal();
    } catch (saveError: any) {
      showToast(saveError?.message ?? "Error al guardar el producto");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>

      <Sidebar navItems={NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <ProductosHeaderSection
          totalFiltrados={productosFiltrados.length}
          onAgregar={openCreateModal}
          onExportar={exportCSV}
        />
        <ProductosStatsSection productos={productos} />
        <ProductosTableSection
          productos={productosFiltrados}
          search={search}
          categoriaActiva={categoriaActiva}
          vistaMode={vistaMode}
          ordenCampo={ordenCampo}
          ordenDir={ordenDir}
          totalCount={productos.length}
          onSearchChange={setSearch}
          onCategoriaChange={setCategoriaActiva}
          onVistaModeChange={setVistaMode}
          onToggleOrden={toggleOrden}
          onView={(p) => showToast(`Viendo ${p.nombre}`)}
          onEdit={openEditModal}
          onDelete={async (p) => {
            if (confirm(`Eliminar ${p.nombre}?`)) {
              await eliminarProducto(p.id);
            }
          }}
        />
        {loading && <p>Cargando productos...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={modalMode === "create" ? "Agregar producto" : "Editar producto"}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div
              style={{
                padding: "4px 0 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                Identidad del producto
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Nombre <span style={{ color: t.error }}>*</span></span>
                  <input
                    value={formValues.nombre ?? ""}
                    onChange={(e) => setFormValues((s) => ({ ...s, nombre: e.target.value }))}
                    type="text"
                    autoFocus
                    placeholder="ej. iPhone 15 Pro Max 256GB"
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>SKU</span>
                  <input
                    value={formValues.sku ?? ""}
                    onChange={(e) => setFormValues((s) => ({ ...s, sku: e.target.value }))}
                    type="text"
                    placeholder="ej. SKU-001"
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Categoria</span>
                  <select
                    value={String(formValues.categoria ?? "")}
                    onChange={(e) => setFormValues((s) => ({ ...s, categoria: e.target.value }))}
                  >
                    <option value="" disabled>Seleccionar categoria</option>
                    {odooCategories.length > 0 ? (
                      odooCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Cargando categorias...</option>
                    )}
                  </select>
                </label>
              </div>
            </div>

            <div
              style={{
                padding: "4px 0 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                Precios
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Precio de venta</span>
                  <input
                    value={formValues.precio ?? 0}
                    onChange={(e) => setFormValues((s) => ({ ...s, precio: Number(e.target.value) || 0 }))}
                    type="number"
                    min={0}
                    step="0.01"
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Costo</span>
                  <input
                    value={formValues.costo ?? 0}
                    onChange={(e) => setFormValues((s) => ({ ...s, costo: Number(e.target.value) || 0 }))}
                    type="number"
                    min={0}
                    step="0.01"
                  />
                </label>
              </div>
            </div>

            <div
              style={{
                padding: "4px 0 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                Inventario
              </p>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Stock inicial</span>
                <input
                  value={formValues.stock ?? 0}
                  onChange={(e) => setFormValues((s) => ({ ...s, stock: Number(e.target.value) || 0 }))}
                  type="number"
                  min={0}
                  step="1"
                />
              </label>
            </div>

            <div style={{ padding: "4px 0 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                  Imagen principal
                </p>
                <label className="btn-secondary" style={{ display: "inline-flex", cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => void handleImageChange(e.target.files?.[0] ?? null)}
                    style={{ display: "none" }}
                  />
                  Subir imagen
                </label>
              </div>

              {formValues.imageDataUrl ? (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", background: "white" }}>
                  <div style={{ height: 180, background: `url(${formValues.imageDataUrl}) center/cover no-repeat` }} />
                  <div style={{ padding: 10, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => setFormValues((prev) => ({ ...prev, imageDataUrl: "" }))}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 14, border: `1px dashed ${t.border}`, borderRadius: 12, color: t.textSecondary, fontSize: 13 }}>
                  No hay imagen cargada.
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={guardaryCerrar} className="btn-primary">
              {modalMode === "create" ? "Crear producto" : "Guardar cambios"}
            </button>
          </div>
        </Modal>
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
