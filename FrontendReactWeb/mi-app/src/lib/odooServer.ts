/**
 * Configuración de Odoo para Server Components y Route Handlers
 * NO incluye "use client" - seguro para usar en servidor
 */

export const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8069";

/**
 * Obtiene la URL base de Odoo de forma segura en el servidor
 */
export function getOdooUrl(): string {
  const url = ODOO_URL;
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_ODOO_URL is not configured. Check your .env.local file.');
  }
  
  // Asegurar que no tenga trailing slash
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
