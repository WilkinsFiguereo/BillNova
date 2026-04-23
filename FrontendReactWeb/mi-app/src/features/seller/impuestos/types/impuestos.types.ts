export type TipoImpuesto =
  | "itbis"
  | "isr"
  | "isc"
  | "retencion"
  | "exento"
  | "selectivo"
  | "decoracion"
  | "otro";

export type AplicacionTipo = "producto" | "servicio" | "ambos";

export interface Impuesto {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoImpuesto;
  tasa: number;
  aplicacion: AplicacionTipo;
  afectaprecio: boolean;
  aplicaitbis: boolean;
  cuenta_contable: string;
  activo: boolean;
  descripcion?: string;
}

export interface CalcPreview {
  base: number;
  itbis: number;
  impuesto: number;
  total: number;
}

export interface ImpuestosStats {
  total: number;
  activos: number;
  retenciones: number;
  exentos: number;
}