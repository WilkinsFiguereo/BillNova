import type { Servicio } from "../types/servicios.types";

export const MOCK_SERVICIOS: Servicio[] = [
  {
    id: "1",
    nombre: "Mantenimiento Preventivo",
    descripcion: "Visita técnica mensual para revisión y ajustes.",
    detalles:
      "Incluye revisión general, limpieza básica, verificación de componentes y reporte de estado. No incluye repuestos.",
    precio: 2500,
    pagoFrecuencia: "mensual",
    status: "activo",
    imageUrl: "",
    ultimaActualizacion: new Date().toISOString().split("T")[0],
  },
  {
    id: "2",
    nombre: "Consultoría Express",
    descripcion: "Sesión única de 60 minutos.",
    detalles:
      "Análisis rápido del caso, recomendaciones accionables y plan de próximos pasos. Sesión por videollamada.",
    precio: 1800,
    pagoFrecuencia: "unico",
    status: "activo",
    imageUrl: "",
    ultimaActualizacion: new Date().toISOString().split("T")[0],
  },
  {
    id: "3",
    nombre: "Soporte Prioritario",
    descripcion: "Atención en horario extendido con prioridad.",
    detalles:
      "Canal dedicado, SLA 4h, seguimiento y reportes semanales. Ideal para operaciones críticas.",
    precio: 4900,
    pagoFrecuencia: "semanal",
    status: "inactivo",
    imageUrl: "",
    ultimaActualizacion: new Date().toISOString().split("T")[0],
  },
];

