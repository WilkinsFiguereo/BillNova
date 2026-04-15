// src/lib/odooConfig.ts
// Configuración global de la conexión con Odoo.
// Importar desde cualquier feature: import odooConfig from "@/lib/odooConfig"

const odooConfig = {
  baseUrl: process.env.NEXT_PUBLIC_ODOO_URL ?? "https://jwfn4vcd-8079.use2.devtunnels.ms/",
} as const;

export default odooConfig;