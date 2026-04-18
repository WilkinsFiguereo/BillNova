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
  } = useModeration();

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
        <ModerationHeaderSection />

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
