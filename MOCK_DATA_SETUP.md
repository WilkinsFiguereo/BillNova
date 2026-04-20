# 🔧 Solución: Configuración de Mock Data

## ✅ Problema Resuelto

El hook `useDashboard` ahora verifica correctamente la variable `NEXT_PUBLIC_USE_MOCK`:

**Antes:** Siempre intentaba conectar al backend, incluso con mock activado.

**Ahora:** 
- Si `NEXT_PUBLIC_USE_MOCK=true` → Usa datos mock de inmediato
- Si `NEXT_PUBLIC_USE_MOCK=false` → Intenta conectar al backend

## 📋 Configuración Actual

Archivo: `.env.local`
```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
NEXT_PUBLIC_USE_MOCK=true
```

### Explicación

| Variable | Valor | Efecto |
|----------|-------|--------|
| `NEXT_PUBLIC_ODOO_URL` | `http://localhost:8069` | URL del servidor Odoo (ajusta según tu setup) |
| `NEXT_PUBLIC_USE_MOCK` | `true` | Usa datos de ejemplo, no intenta conectar a Odoo |

## 🎯 Escenarios de Uso

### 📱 Desarrollo Local (Recomendado Ahora)
```env
NEXT_PUBLIC_USE_MOCK=true
```
✅ Funciona sin servidor Odoo
✅ No hay errores de conexión
✅ Verifica la UI con datos seguros

### 🚀 Producción (Cuando Odoo esté listo)
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_ODOO_URL=https://tuservidor.com
```
✅ Conecta al servidor Odoo real
✅ Carga datos en vivo

## 🔍 Cómo Validar

### En la Consola del Navegador (F12)

**Con USE_MOCK=true deberías ver:**
```
[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)
```

**Con USE_MOCK=false deberías ver:**
```
[Companies API] Fetching from: http://localhost:8069/api/companies
[Companies API] Response status: 200
```

### Métodos Configurados

1. **Empresas (Dashboard)**
   - Hook: `useDashboard()`
   - Archivo: `src/features/admin/companies/hooks/useDashboard.ts`
   - Ruta: `/api/companies` → `/api/companies` (Odoo)

2. **Usuarios**
   - Hook: `useUsers()`
   - Archivo: `src/features/admin/users/hooks/useUsers.ts`
   - Ya tiene check de `USE_MOCK` implementado ✅

## 📝 Logs Mejorados

Todos los logs ahora tienen prefijo `[Dashboard]` o `[Companies API]` para fácil debugging:

```
[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)
[Dashboard] Companies API response status: 200
[Dashboard] Error fetching companies: TypeError: fetch failed
[Dashboard] Using mock data as fallback (error)
```

## ⚠️ Cuando Quieras Usar el Servidor Real

1. Asegúrate que Odoo está corriendo en la URL configurada
2. Cambia `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK=false
   ```
3. Reinicia el dev server: `npm run dev`
4. Revisa F12 → Console para ver los logs de conexión

## 📚 Archivos Modificados

- ✅ `src/features/admin/companies/hooks/useDashboard.ts` - Agregado check de USE_MOCK
- ✅ `.env.local` - Creado con mock activado
- ✅ `src/lib/odooServer.ts` - Configuración segura para servidor
- ✅ `app/api/companies/route.ts` - Actualizado para usar odooServer

¿Listo para probarlo?
