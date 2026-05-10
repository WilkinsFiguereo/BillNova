"use client";

import React, { useMemo, useState } from "react";
import { serviciosTheme as t, globalStyles } from "../theme/servicios.theme";
import { useServicios } from "../hooks/useServicios";
import { Toast } from "../ui/ServicioUI";
import { ServiciosHeaderSection } from "../sections/ServiciosHeaderSection";
import { ServiciosStatsSection } from "../sections/ServiciosStatsSection";
import { ServiciosTableSection } from "../sections/ServiciosTableSection";
import { Modal } from "@/features/admin/users/ui/Modal";
import type { PagoFrecuencia, Servicio, ServicioStatus } from "../types/servicios.types";

import { Sidebar } from "../../dashboard/dashboards";
import { NAV_ITEMS } from "../../dashboard/data/chart.data";

const defaultForm: Partial<Servicio> = {
  nombre: "",
  descripcion: "",
  detalles: "",
  precio: 0,
  pagoFrecuencia: "unico",
  status: "activo",
  imageDataUrls: [],
};

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

function labelFrecuencia(v: PagoFrecuencia) {
  const map: Record<PagoFrecuencia, string> = {
    unico: "Pago unico",
    diario: "Diario",
    semanal: "Semanal",
    quincenal: "Cada 15 dias",
    mensual: "Mensual",
    anual: "Anual",
  };
  return map[v];
}

function labelStatus(v: ServicioStatus) {
  return v === "activo" ? "Activo" : "Inactivo";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export default function ServiciosPage() {
  const {
    servicios,
    loading,
    error,
    search,
    frecuenciaActiva,
    vistaMode,
    ordenCampo,
    ordenDir,
    toastVisible,
    toastMsg,
    serviciosFiltrados,
    setSearch,
    setFrecuenciaActiva,
    setVistaMode,
    toggleOrden,
    showToast,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    refreshServicios,
  } = useServicios();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [formValues, setFormValues] = useState<Partial<Servicio>>(defaultForm);

  const openCreateModal = () => {
    setModalMode("create");
    setSelected(null);
    setFormValues(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Servicio) => {
    setModalMode("edit");
    setSelected(s);
    setFormValues({
      nombre: s.nombre,
      descripcion: s.descripcion,
      detalles: s.detalles,
      precio: s.precio,
      pagoFrecuencia: s.pagoFrecuencia,
      status: s.status,
      imageDataUrls: s.imageUrls ?? (s.imageUrl ? [s.imageUrl] : []),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setFormValues(defaultForm);
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Nombre",
      "Descripcion",
      "Detalles",
      "Precio",
      "Frecuencia",
      "Estado",
      "Imagen",
      "Ultima actualizacion",
    ];

    const rows = [
      ["BillNova", "Catalogo de servicios"],
      ["Generado", new Date().toLocaleString("es-DO")],
      ["Total exportado", String(serviciosFiltrados.length)],
      [],
      headers,
      ...serviciosFiltrados.map((s) => [
        s.id,
        s.nombre,
        s.descripcion,
        s.detalles,
        String(s.precio),
        s.pagoFrecuencia,
        s.status,
        s.imageUrl ? "Si" : "No",
        s.ultimaActualizacion,
      ]),
    ];

    const content = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "servicios.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const frecuenciaOptions = useMemo<PagoFrecuencia[]>(
    () => ["unico", "diario", "semanal", "quincenal", "mensual", "anual"],
    [],
  );

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
    } catch (e: any) {
      showToast(e?.message ?? "No se pudo cargar la imagen.");
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
      showToast("El nombre del servicio es obligatorio");
      return;
    }
    if (!formValues.descripcion?.trim()) {
      showToast("La descripcion es obligatoria");
      return;
    }
    if ((formValues.imageDataUrls ?? []).length < MIN_IMAGES) {
      showToast("Debes agregar al menos 1 imagen.");
      return;
    }

    const payload: Partial<Servicio> = {
      nombre: String(formValues.nombre ?? "").trim(),
      descripcion: String(formValues.descripcion ?? "").trim(),
      detalles: String(formValues.detalles ?? ""),
      precio: Number(formValues.precio ?? 0),
      pagoFrecuencia: (formValues.pagoFrecuencia as PagoFrecuencia) ?? "unico",
      status: (formValues.status as ServicioStatus) ?? "activo",
      imageDataUrls: formValues.imageDataUrls ?? [],
    };

    try {
      if (modalMode === "create") {
        await crearServicio(payload);
        showToast("Servicio creado correctamente");
      } else if (modalMode === "edit" && selected) {
        await actualizarServicio(selected.id, payload);
        showToast("Servicio actualizado correctamente");
      }
      await refreshServicios();
      closeModal();
    } catch (e: any) {
      showToast(e?.message ?? "Error al guardar el servicio");
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
        <ServiciosHeaderSection totalFiltrados={serviciosFiltrados.length} onAgregar={openCreateModal} onExportar={exportCSV} />
        <ServiciosStatsSection servicios={servicios} />

        <ServiciosTableSection
          servicios={serviciosFiltrados}
          search={search}
          frecuenciaActiva={frecuenciaActiva}
          vistaMode={vistaMode}
          ordenCampo={ordenCampo}
          ordenDir={ordenDir}
          totalCount={servicios.length}
          onSearchChange={setSearch}
          onFrecuenciaChange={setFrecuenciaActiva}
          onVistaModeChange={setVistaMode}
          onToggleOrden={toggleOrden}
          onView={(s) => showToast(`Viendo ${s.nombre}`)}
          onEdit={openEditModal}
          onDelete={async (s) => {
            if (confirm(`Eliminar ${s.nombre}?`)) {
              await eliminarServicio(s.id);
            }
          }}
        />

        {loading && <p>Cargando servicios...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title={modalMode === "create" ? "Agregar servicio" : "Editar servicio"}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              Nombre
              <input
                value={formValues.nombre ?? ""}
                onChange={(e) => setFormValues((s) => ({ ...s, nombre: e.target.value }))}
                type="text"
                autoFocus
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              Descripcion
              <input
                value={formValues.descripcion ?? ""}
                onChange={(e) => setFormValues((s) => ({ ...s, descripcion: e.target.value }))}
                type="text"
                placeholder="Resumen corto del servicio"
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "span 2" }}>
              Detalles del servicio
              <textarea
                value={formValues.detalles ?? ""}
                onChange={(e) => setFormValues((s) => ({ ...s, detalles: e.target.value }))}
                rows={5}
                placeholder="Incluye que cubre, condiciones y alcance."
                style={{ resize: "vertical" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              Precio
              <input
                value={formValues.precio ?? 0}
                onChange={(e) => setFormValues((s) => ({ ...s, precio: Number(e.target.value) || 0 }))}
                type="number"
                min={0}
                step="0.01"
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              Frecuencia de pago
              <select
                value={(formValues.pagoFrecuencia as PagoFrecuencia) ?? "unico"}
                onChange={(e) => setFormValues((s) => ({ ...s, pagoFrecuencia: e.target.value as PagoFrecuencia }))}
              >
                {frecuenciaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {labelFrecuencia(opt)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              Estado
              <select
                value={(formValues.status as ServicioStatus) ?? "activo"}
                onChange={(e) => setFormValues((s) => ({ ...s, status: e.target.value as ServicioStatus }))}
              >
                {(["activo", "inactivo"] as const).map((opt) => (
                  <option key={opt} value={opt}>
                    {labelStatus(opt)}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Galeria de imagenes</div>
                <label className="btn-secondary" style={{ display: "inline-flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
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
                          className="icon-btn danger"
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

          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={guardaryCerrar} className="btn-primary">
              {modalMode === "create" ? "Crear" : "Actualizar"}
            </button>
          </div>
        </Modal>
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
