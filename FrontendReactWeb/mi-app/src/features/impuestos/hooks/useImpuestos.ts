"use client";

import { useCallback, useMemo, useState } from "react";
import type { Impuesto, ImpuestosStats, CalcPreview } from "../types/impuestos.types";

export function useImpuestos() {
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const crear = useCallback(async (data: Partial<Impuesto>) => {
    showToast("Impuesto creado");
  }, [showToast]);

  const editar = useCallback(async (id: string, data: Partial<Impuesto>) => {
    showToast("Impuesto actualizado");
  }, [showToast]);

  const eliminar = useCallback(async (id: string) => {
    showToast("Impuesto eliminado");
  }, [showToast]);

  const syncOdoo = useCallback(async () => {
    showToast("Sincronizando con Odoo...");
  }, [showToast]);

  const filteredImpuestos = useMemo(() => {
    let result = [...impuestos];
    if (search) {
      result = result.filter(i =>
        i.nombre.toLowerCase().includes(search.toLowerCase()) ||
        i.codigo.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filtroTipo !== "Todos") {
      result = result.filter(i => i.tipo === filtroTipo);
    }
    return result;
  }, [impuestos, search, filtroTipo]);

  const stats: ImpuestosStats = useMemo(() => ({
    total: impuestos.length,
    activos: impuestos.filter(i => i.activo).length,
    retenciones: impuestos.filter(i => i.tipo === "retencion").length,
    exentos: impuestos.filter(i => i.tipo === "exento").length,
  }), [impuestos]);

  return {
    impuestos,
    filteredImpuestos,
    stats,
    search,
    setSearch,
    filtroTipo,
    setFiltroTipo,
    toastVisible,
    toastMsg,
    crear,
    editar,
    eliminar,
    syncOdoo,
  };
}

export function calcularImpuesto(base: number, tasa: number, aplicaItbis: boolean) {
  const itbis = aplicaItbis ? base * 0.18 : 0;
  const impuesto = base * (tasa / 100);
  return {
    base,
    itbis,
    impuesto,
    total: base + itbis + impuesto,
  } as CalcPreview;
}