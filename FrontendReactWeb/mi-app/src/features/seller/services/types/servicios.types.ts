export type PagoFrecuencia =
  | "unico"
  | "diario"
  | "semanal"
  | "quincenal"
  | "mensual"
  | "anual";

export type ServicioStatus = "activo" | "inactivo";

export interface ServicioImagen {
  id: string;
  name: string;
  dataUrl: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  detalles: string;
  precio: number;
  pagoFrecuencia: PagoFrecuencia;
  status: ServicioStatus;
  imagenes: ServicioImagen[];
  ultimaActualizacion: string;
}

export type VistaMode = "tabla" | "grilla";
export type OrdenCampo = "nombre" | "precio" | "pagoFrecuencia" | "status";
export type OrdenDir = "asc" | "desc";

