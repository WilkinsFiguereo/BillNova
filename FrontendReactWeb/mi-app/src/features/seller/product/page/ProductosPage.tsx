"use client";

import React, { useEffect, useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { productosTheme as t, globalStyles } from "../theme/productos.theme";
import { Toast } from "../ui/ProductoCard";
import { ProductosHeaderSection } from "../sections/ProductosHeaderSection";
import { ProductosStatsSection } from "../sections/ProductosStatsSection";
import { ProductosTableSection } from "../sections/ProductosTableSection";
import { Modal } from "@/features/admin/users/ui/Modal";
import type { Producto, ProductCategory } from "../types/productos.types";

// Reutilizamos el Sidebar y los nav items del dashboard
import { Sidebar }   from "../../dashboard/dashboards";
import { NAV_ITEMS } from "../../dashboard/data/chart.data";
import { apiListCategorias } from "../data/productApi";

const defaultForm: Partial<Producto> = {
  nombre: "",
  sku: "",
  categoria: "Electrónica" as ProductCategory,
  stock: 0,
  precio: 0,
  costo: 0,
  proveedor: "",
};

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

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setFormValues(defaultForm);
    setIsModalOpen(true);
  };

  // 1. Agrega este estado al inicio del componente:
  
  const [odooCategories, setOdooCategories] = useState<{ id: number; name: string }[]>([]);

  // Importa la función
  // useEffect — se ejecuta al montar
  useEffect(() => {
    apiListCategorias()
      .then(setOdooCategories)
      .catch(() => setOdooCategories([]));
  }, []);

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
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormValues(defaultForm);
  };

  const exportCSV = () => {
    const headers = ["ID", "Nombre", "SKU", "Categoría", "Stock", "Precio", "Costo", "Margen", "Proveedor", "Última actualización"];
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

  const guardaryCerrar = async () => {
    if (!formValues.nombre?.trim()) {
      showToast("El nombre del producto es obligatorio");
      return;
    }

    const payload = {
      nombre: formValues.nombre,
      sku: formValues.sku || "",
      precio: Number(formValues.precio ?? 0),
      costo: Number(formValues.costo ?? 0),
      stock: Number(formValues.stock ?? 0),
      categoria: (formValues.categoria as ProductCategory) || "Electrónica",
      proveedor: formValues.proveedor || "",
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
    } catch (error: any) {
      showToast(error?.message ?? "Error al guardar el producto");
    }
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: t.bgMain, color: t.textPrimary,
    }}>
      <style>{globalStyles(t)}</style>

      {/* Sidebar compartido — pathname detecta automáticamente que estamos en /productos */}
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
          onEdit={(p) => openEditModal(p)}
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

              {/* Sección: Identidad */}
              <div style={{
                padding: "4px 0 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                  Identidad del producto
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Nombre — ocupa todo el ancho */}
                  <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Nombre <span style={{ color: t.error }}>*</span></span>
                    <input
                      value={formValues.nombre ?? ""}
                      onChange={(e) => setFormValues((s) => ({ ...s, nombre: e.target.value }))}
                      type="text"
                      autoFocus
                      placeholder="ej. iPhone 15 Pro Max 256GB"
                      style={{
                        background: t.bgAlt,
                        border: `1.5px solid ${t.border}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: t.textPrimary,
                        outline: "none",
                        transition: "border-color 0.15s",
                        fontFamily: "inherit",
                      }}
                      onFocus={e => (e.target.style.borderColor = t.brand400)}
                      onBlur={e => (e.target.style.borderColor = t.border)}
                    />
                  </label>

                  {/* SKU */}
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>SKU</span>
                    <input
                      value={formValues.sku ?? ""}
                      onChange={(e) => setFormValues((s) => ({ ...s, sku: e.target.value }))}
                      type="text"
                      placeholder="ej. SKU-001"
                      style={{
                        background: t.bgAlt,
                        border: `1.5px solid ${t.border}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        fontFamily: "'DM Mono', monospace",
                        color: t.textPrimary,
                        outline: "none",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={e => (e.target.style.borderColor = t.brand400)}
                      onBlur={e => (e.target.style.borderColor = t.border)}
                    />
                  </label>

                  {/* Categoría */}
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Categoría</span>
                    <select
                        value={formValues.categoria ?? ""}
                        onChange={(e) => setFormValues((s) => ({ ...s, categoria: e.target.value as any }))}
                      style={{
                        background: t.bgAlt,
                        border: `1.5px solid ${t.border}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: formValues.categoria ? t.textPrimary : t.textDisabled,
                        outline: "none",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                        fontFamily: "inherit",
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        paddingRight: 36,
                      }}
                      onFocus={e => (e.target.style.borderColor = t.brand400)}
                      onBlur={e => (e.target.style.borderColor = t.border)}
                    >
                      <option value="" disabled>Seleccionar categoría</option>
                        {odooCategories.length > 0 ? (
                          odooCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>Cargando categorías...</option>
                        )}
                    </select>
                  </label>
                </div>
              </div>

              {/* Sección: Precios */}
              <div style={{
                padding: "4px 0 16px",
                borderBottom: `1px solid ${t.border}`,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                  Precios
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Precio */}
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Precio de venta</span>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        fontSize: 13, color: t.textDisabled, fontFamily: "'DM Mono', monospace",
                      }}>$</span>
                      <input
                        value={formValues.precio ?? 0}
                        onChange={(e) => setFormValues((s) => ({ ...s, precio: Number(e.target.value) || 0 }))}
                        type="number" min={0} step="0.01"
                        style={{
                          width: "100%",
                          background: t.bgAlt,
                          border: `1.5px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px 10px 26px",
                          fontSize: 13,
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 600,
                          color: t.textPrimary,
                          outline: "none",
                          transition: "border-color 0.15s",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => (e.target.style.borderColor = t.brand400)}
                        onBlur={e => (e.target.style.borderColor = t.border)}
                      />
                    </div>
                  </label>

                  {/* Costo */}
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Costo</span>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        fontSize: 13, color: t.textDisabled, fontFamily: "'DM Mono', monospace",
                      }}>$</span>
                      <input
                        value={formValues.costo ?? 0}
                        onChange={(e) => setFormValues((s) => ({ ...s, costo: Number(e.target.value) || 0 }))}
                        type="number" min={0} step="0.01"
                        style={{
                          width: "100%",
                          background: t.bgAlt,
                          border: `1.5px solid ${t.border}`,
                          borderRadius: 10,
                          padding: "10px 14px 10px 26px",
                          fontSize: 13,
                          fontFamily: "'DM Mono', monospace",
                          color: t.textPrimary,
                          outline: "none",
                          transition: "border-color 0.15s",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => (e.target.style.borderColor = t.brand400)}
                        onBlur={e => (e.target.style.borderColor = t.border)}
                      />
                    </div>
                  </label>

                  {/* Preview de margen */}
                  {(formValues.precio ?? 0) > 0 && (
                    <div style={{
                      gridColumn: "span 2",
                      background: t.bgAlt,
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 12, color: t.textSecondary }}>Margen estimado</span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        color: (((formValues.precio ?? 0) - (formValues.costo ?? 0)) / (formValues.precio ?? 1)) * 100 >= 30
                          ? t.success : t.warning,
                      }}>
                        {((((formValues.precio ?? 0) - (formValues.costo ?? 0)) / (formValues.precio ?? 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección: Inventario */}
              <div style={{ padding: "4px 0 4px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                  Inventario
                </p>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>Stock inicial</span>
                  <input
                    value={formValues.stock ?? 0}
                    onChange={(e) => setFormValues((s) => ({ ...s, stock: Number(e.target.value) || 0 }))}
                    type="number" min={0} step="1"
                    style={{
                      background: t.bgAlt,
                      border: `1.5px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontFamily: "'DM Mono', monospace",
                      color: t.textPrimary,
                      outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => (e.target.style.borderColor = t.brand400)}
                    onBlur={e => (e.target.style.borderColor = t.border)}
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}>
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