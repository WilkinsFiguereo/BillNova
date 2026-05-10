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
  imageDataUrls: [],
};

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

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
      imageDataUrls: p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []),
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
    const rows = [
      ["BillNova", "Catalogo de productos"],
      ["Generado", new Date().toLocaleString("es-DO")],
      ["Total exportado", String(productosFiltrados.length)],
      [],
      headers,
      ...productosFiltrados.map((p) => {
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
      }),
    ];

    const content = rows
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

  const handleImageChange = async (files: FileList | null) => {
    if (!files?.length) return;
    const currentImages = formValues.imageDataUrls ?? [];
    const availableSlots = MAX_IMAGES - currentImages.length;
    if (availableSlots <= 0) {
      showToast("Solo puedes agregar hasta 5 imagenes.");
      return;
    }

    try {
      const selectedFiles = Array.from(files).slice(0, availableSlots);
      const nextImages = await Promise.all(selectedFiles.map(readFileAsDataUrl));
      setFormValues((prev) => ({
        ...prev,
        imageDataUrls: [...(prev.imageDataUrls ?? []), ...nextImages].slice(0, MAX_IMAGES),
      }));
      if (files.length > availableSlots) {
        showToast("Solo se cargaron las primeras 5 imagenes.");
      }
    } catch (error: any) {
      showToast(error?.message ?? "No se pudo cargar la imagen.");
    }
  };

  const removeImageAt = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      imageDataUrls: (prev.imageDataUrls ?? []).filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const guardaryCerrar = async () => {
    if (!formValues.nombre?.trim()) {
      showToast("El nombre del producto es obligatorio");
      return;
    }
    if ((formValues.imageDataUrls ?? []).length < MIN_IMAGES) {
      showToast("Debes agregar al menos 1 imagen.");
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
      imageDataUrls: formValues.imageDataUrls ?? [],
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
                  Galeria de imagenes
                </p>
                <label className="btn-secondary" style={{ display: "inline-flex", cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      void handleImageChange(e.target.files);
                      e.currentTarget.value = "";
                    }}
                    style={{ display: "none" }}
                  />
                  Subir imagenes
                </label>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: t.textSecondary }}>
                Minimo {MIN_IMAGES}, maximo {MAX_IMAGES}. La primera sera la principal.
              </p>

              {(formValues.imageDataUrls ?? []).length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                  {(formValues.imageDataUrls ?? []).map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", background: "white" }}>
                      <div style={{ height: 140, background: `url(${imageUrl}) center/cover no-repeat` }} />
                      <div style={{ padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: t.textSecondary }}>
                          {index === 0 ? "Principal" : `Imagen ${index + 1}`}
                        </span>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => removeImageAt(index)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 14, border: `1px dashed ${t.border}`, borderRadius: 12, color: t.textSecondary, fontSize: 13 }}>
                  No hay imagenes cargadas.
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
