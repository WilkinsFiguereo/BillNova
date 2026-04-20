"use client";

import React from "react";
import { useModeration } from "@/features/moderator/product_moderation/hooks/useModeration";
import {
  moderationTheme as t,
  globalStyles,
} from "@/features/moderator/product_moderation/theme/moderation.theme";
import {
  Toast,
  ModalRechazar,
} from "@/features/moderator/product_moderation/ui/ModerationUI";
import { ModerationHeaderSection } from "@/features/moderator/product_moderation/sections/ModerationHeaderSection";
import { ModerationListaSection } from "@/features/moderator/product_moderation/sections/ModerationListSection";
import { ModerationDetallePanel } from "@/features/moderator/product_moderation/sections/ModerationDetailPanel";
import { AdminSidebar } from "../dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "../dashboard/data/adminNavigation.data";

export default function AdminProductsPage() {
  const {
    search,
    filtroActivo,
    productoDetalle,
    modalRechazarVisible,
    productoARechazar,
    motivoRechazo,
    toastVisible,
    toastMsg,
    toastTipo,
    productosFiltrados,
    contadores,
    setSearch,
    setFiltroActivo,
    setMotivoRechazo,
    verDetalle,
    aprobar,
    abrirModalRechazar,
    cerrarModalRechazar,
    confirmarRechazo,
  } = useModeration({ useMock: true });

  const [categories, setCategories] = React.useState<string[]>([
    "Electrónica",
    "Moda",
    "Hogar",
  ]);
  const [newCategory, setNewCategory] = React.useState("");
  const [categoryError, setCategoryError] = React.useState("");

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setCategoryError("Escribe el nombre de la categoría antes de crearla.");
      return;
    }

    const exists = categories.some(
      (category) => category.toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      setCategoryError("Esa categoría ya existe.");
      return;
    }

    setCategories((prev) => [trimmed, ...prev]);
    setNewCategory("");
    setCategoryError("");
  };

  const handleNewCategoryKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddCategory();
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

      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px",
          marginRight: productoDetalle ? 420 : 0,
          transition: "margin-right 0.25s ease",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 24 }}>
          <div>
            <ModerationHeaderSection />
          </div>
          <aside
            style={{
              background: "white",
              borderRadius: 18,
              border: `1px solid ${t.border}`,
              padding: 24,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              minHeight: 220,
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.textPrimary }}>
                Categorías de productos
              </h2>
              <p style={{ margin: "8px 0 0", color: t.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
                Crea y organiza las categorías que usarás para clasificar los productos.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <input
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setCategoryError("");
                }}
                onKeyDown={handleNewCategoryKeyDown}
                placeholder="Nombre de categoría"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  outline: "none",
                  fontSize: 14,
                  color: t.textPrimary,
                  background: t.bgAlt,
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "none",
                  background: t.brand600,
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  minWidth: 120,
                }}
              >
                Crear
              </button>
            </div>

            {categoryError ? (
              <p style={{ color: "#d32f2f", margin: "0 0 14px", fontSize: 13 }}>
                {categoryError}
              </p>
            ) : null}

            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>
                  Categorías guardadas
                </span>
                <span style={{ fontSize: 12, color: t.textSecondary }}>
                  {categories.length}
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {categories.map((category) => (
                  <li
                    key={category}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: t.bgAlt,
                      color: t.textPrimary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <ModerationListaSection
          productos={productosFiltrados}
          search={search}
          filtroActivo={filtroActivo}
          contadores={contadores}
          onSearchChange={setSearch}
          onFiltroChange={setFiltroActivo}
          onVerDetalle={verDetalle}
          onAprobar={aprobar}
          onRechazar={abrirModalRechazar}
        />
      </main>

      {productoDetalle && (
        <ModerationDetallePanel
          producto={productoDetalle}
          onCerrar={() => verDetalle(null)}
          onAprobar={(id) => {
            aprobar(id);
          }}
          onRechazar={abrirModalRechazar}
        />
      )}

      {modalRechazarVisible && productoARechazar && (
        <ModalRechazar
          nombreProducto={productoARechazar.nombre}
          motivo={motivoRechazo}
          onMotivoChange={setMotivoRechazo}
          onConfirmar={confirmarRechazo}
          onCancelar={cerrarModalRechazar}
        />
      )}

      <Toast message={toastMsg} visible={toastVisible} tipo={toastTipo} />
    </div>
  );
}
