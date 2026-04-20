# 🔍 Guía de Debugging - Error de Carga de Empresas

## ❌ El Problema
El error `Backend error details: {}` significa que el servidor está devolviendo un objeto vacío cuando intenta cargar las empresas.

## ✅ Soluciones

### Paso 1: Activar Datos Mock (Temporal)
El archivo `.env.local` ya ha sido configurado con:
```env
NEXT_PUBLIC_USE_MOCK=true
```

Esto hace que la app muestre datos de ejemplo mientras configuras el backend.

**Para desactivar mock data y conectarse al servidor real:**
```env
NEXT_PUBLIC_USE_MOCK=false
```

---

### Paso 2: Verificar la URL del Servidor Odoo

Edita `.env.local` y asegúrate de que `NEXT_PUBLIC_ODOO_URL` sea la correcta:

```env
NEXT_PUBLIC_ODOO_URL=http://tuservidor:8069
```

**Opciones comunes:**
- Local: `http://localhost:8069`
- Docker: `http://odoobackend:8069` o `http://host.docker.internal:8069`
- Remoto: `https://tudominio.com`

---

### Paso 3: Verificar que el Servidor Esté Funcionando

En el navegador, intenta acceder directamente a:

```
https://tuservidor:8069/api/companies
```

**Deberías ver una respuesta JSON como esta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Empresa 1",
      "email": "contact@empresa1.com",
      ...
    }
  ]
}
```

**Si ves un error 404 o blanco:**
- ❌ El servidor Odoo no está corriendo
- ❌ La URL es incorrecta
- ❌ El módulo BillNova no está instalado

---

### Paso 4: Revisar la Consola del Navegador (F12)

1. Abre F12 → Pestaña **Console**
2. Busca logs con `[Companies API]`
3. Deberías ver algo como:
   ```
   [Companies API] Fetching from: http://localhost:8069/api/companies
   [Companies API] Response status: 200
   [Companies API] Success, companies count: 5
   ```

Si ves:
```
[Companies API] Response status: 404
[Companies API] Backend error 404: Not Found
```

Significa que el endpoint no existe. Verifica que el módulo BillNova está instalado en Odoo.

---

### Paso 5: Verificar el Backend Odoo

Si el servidor está caído, debes iniciar Odoo:

**Con Docker:**
```bash
docker-compose up -d
```

**Verificar logs:**
```bash
docker-compose logs -f odoo
```

**Verificar que está corriendo:**
```bash
curl http://localhost:8069/api/companies
```

---

## 🐛 Errores Comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Connection refused` | Servidor no está corriendo | Inicia Docker/Odoo |
| ` 404 Not Found` | Endpoint no existe | Instala módulo BillNova |
| `503 Service Unavailable` | Servidor sobrecargado | Reinicia Odoo |
| `data: []` (array vacío) | No hay empresas en DB | Crea una empresa en Odoo |
| `CORS error` | Problema de permisos | Verifica headers CORS |

---

## 📝 Cambios Realizados

1. ✅ **Creado `.env.local`** - Para configuración local
2. ✅ **Mejorado `useDashboard.ts`** - Mejor manejo de errores y fallback a mock data
3. ✅ **Mejorado `route.ts`** - Logging más detallado para debugging

---

## 🚀 Próximos Pasos

1. Configura la URL correcta en `.env.local`
2. Verifica que el servidor Odoo está corriendo
3. Abre la consola del navegador (F12) y revisa los logs `[Companies API]`
4. Cambia `NEXT_PUBLIC_USE_MOCK=false` para conectarte al servidor real

¿Cuál es la URL de tu servidor Odoo?
