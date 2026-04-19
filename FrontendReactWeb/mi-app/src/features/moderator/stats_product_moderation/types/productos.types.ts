"use client";

export type CategoriaProducto =
  | 'electronica' | 'moda' | 'hogar' | 'alimentos'
  | 'deportes' | 'salud' | 'tecnologia' | 'belleza' | 'otro';

export type EstadoProducto = 'activo' | 'agotado' | 'suspendido' | 'borrador';

export type PeriodoFiltro = '7d' | '30d' | '90d' | '1y';

export type OrdenPor =
  | 'ventas' | 'ingresos' | 'calificacion'
  | 'crecimiento' | 'vistas' | 'devolucion';

export interface VentaMensual {
  mes: string;
  ventas: number;
  ingresos: number;
  vistas: number;
}

export interface ResenaDistribucion {
  estrellas: number; // 1–5
  cantidad: number;
}

export interface Producto {
  id: string;
  nombre: string;
  empresa: string;
  empresaColor: string;
  categoria: CategoriaProducto;
  estado: EstadoProducto;
  precio: number;
  totalVentas: number;
  totalIngresos: number;
  totalVistas: number | null;
  calificacion: number | null;
  totalResenas: number;
  stock: number;
  tasaConversion: number | null;
  tasaDevolucion: number | null;
  crecimiento: number | null;
  ventasMensuales: VentaMensual[];
  resenasDist: ResenaDistribucion[];
  fechaLanzamiento: string;
}

export interface EstadisticasGlobales {
  totalProductos: number;
  productosActivos: number;
  totalVentas: number;
  totalIngresos: number;
  promedioCalificacion: number | null;
  totalVistas: number | null;
  crecimientoGeneral: number | null;
}

export interface FiltrosProductos {
  busqueda: string;
  categoria: CategoriaProducto | 'todos';
  estado: EstadoProducto | 'todos';
  ordenarPor: OrdenPor;
  periodo: PeriodoFiltro;
}
