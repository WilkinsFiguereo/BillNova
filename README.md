# BillNova - Sistema de Gestión Empresarial

**BillNova** es un sistema ERP completo para la gestión de empresas, desarrollado con **Next.js (React)** para el frontend web, **React Native (Expo)** para el frontend móvil, y **Odoo 19** para el backend.

## Estructura del Proyecto

```
ProyectRijo/
├── FrontendReactWeb/          # Frontend Web (Next.js)
│   └── mi-app/
│       ├── app/               # Páginas Next.js App Router
│       ├── src/features/      # Módulos de la aplicación
│       └── lib/               # Utilidades y configuración
├── FrontendReactApp/         # Frontend Móvil (React Native/Expo)
│   └── App-Mobile/
│       ├── src/features/      # Pantallas y componentes
│       └── app.json           # Configuración Expo
├── odooBackend/              # Backend Odoo
│   └── addons/Proyect/       # Módulo personalizado
│       ├── controllers/       # API REST
│       ├── models/            # Modelos de datos
│       └── patches/           # Parches de seguridad
└── README.md
```

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend Web | Next.js 14, React 19, TypeScript |
| Frontend Móvil | Expo SDK 54, React Native 0.81, Expo Router |
| UI Web | Tailwind CSS, Lucide Icons |
| UI Móvil | React Native, Expo UI |
| Backend | Odoo 19, Python |
| Base de datos | PostgreSQL |

## Módulos del Frontend

### Frontend Web (`FrontendReactWeb/mi-app`)

#### `seller` - Panel de Vendedor
- **Dashboard** - Estadísticas y gráficos de ventas
- **Productos** - Gestión de inventario (CRUD)
- **Servicios** - Gestión de servicios
- **Facturas** - Gestión de facturación
- **Pedidos** - Órdenes de compra/venta
- **Reportes** - Reportes y análisis
- **Impuestos** - Calculadora y gestión de impuestos
- **Empresa** - Configuración de empresa
- **Registro de Empresa** - Onboarding

#### `admin` - Panel de Administrador
- Dashboard administrativo
- Gestión de usuarios (BillNova y Odoo)
- Gestión de empresas
- Configuración del sistema

#### `moderator` - Panel de Moderador
- Moderación de productos
- Moderación de empresas
- Reportes de problemas
- Estadísticas

#### `auth` - Autenticación
- Login con sesión
- Registro de usuarios
- Recuperación de contraseña
- Verificación de email
- Gestión de sesiones

---

### Frontend Móvil (`FrontendReactApp/App-Mobile`)

Aplicación móvil desarrollada con **Expo SDK 54** y **React Native**.

#### Características
- **Autenticación** - Login/Registro con navegación
- **Catálogo de Productos** - Vista en grilla y lista
- **Carrito de Compras** - Gestión deitems, códigos promo
- **Carrito** - Estado global con Zustand
- **Navegación** - Bottom tabs con React Navigation
- **UI Components** - Buttons, Inputs, SearchBar, TabBar

#### Estructura de Pantallas
```
src/features/
├── auth/           # Login, Register, AuthHeader
│   ├── components/
│   ├── hooks/
│   ├── screens/
│   └── types/
├── home/           # Home principal
│   ├── hooks/
│   ├── sections/
│   ├── types/
│   ├── ui/
│   └── data/
├── products/       # Catálogo de productos
│   ├── components/
│   ├── hooks/
│   ├── screens/
│   ├── sections/
│   ├── types/
│   ├── ui/
│   └── api/
├── cart/           # Carrito de compras
│   ├── hooks/
│   ├── sections/
│   ├── store/      # Zustand store
│   ├── theme/
│   ├── types/
│   └── ui/
└── shared/
    ├── theme/
    └── ui/
```

#### Ejecución
```bash
cd FrontendReactApp/App-Mobile
npm install
npm start
# o usando Expo
npx expo start --android
npx expo start --ios
```

## API del Backend (Odoo)

### Endpoints disponibles

| Recurso | Métodos | Descripción |
|---------|---------|-------------|
| `/api/auth/*` | POST | Autenticación (login, logout, register) |
| `/api/users/*` | GET, POST, PUT, DELETE | Gestión de usuarios |
| `/api/companies/*` | GET, POST, PUT | Gestión de empresas |
| `/api/products/*` | GET, POST, PUT, DELETE | Gestión de productos |
| `/api/services/*` | GET, POST, PUT, DELETE | Gestión de servicios |
| `/api/taxes/*` | GET | Impuestos |
| `/api/invoices/*` | GET, POST | Facturación |
| `/api/pos/*` | GET, POST | Punto de venta |
| `/api/bitacora/*` | GET | Registro de eventos |
| `/api/moderation/*` | GET, PUT | Moderación |

### Modelos de Datos

- **billnova.user** - Usuarios de la app
- **res.company** - Empresas (extendido)
- **product.product** - Productos (extendido)
- **billnova.service** - Servicios
- **billnova.bitacora** - Registro de auditoría

### Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `admin` | Administrador del sistema |
| `moderator` | Moderador de contenido |
| `gerente` | Gerente de empresa |
| `seller` | Vendedor |

## Configuración

### Variables de Entorno

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8079
```

**Backend Odoo** (`odoo.conf`):
```ini
[options]
admin_passwd = admin
db_host = db
db_port = 5432
db_user = odoo
db_password = odoo
addons_path = /mnt/extra-addons
```

## Ejecución

### Frontend Web
```bash
cd FrontendReactWeb/mi-app
npm install
npm run dev
# Acceder: http://localhost:3000
```

### Frontend Móvil (Expo)
```bash
cd FrontendReactApp/App-Mobile
npm install
npm start
# o usando Expo
npx expo start --android
npx expo start --ios
# Escanea el QR con la app Expo Go
```

### Backend Odoo
```bash
# Con Docker
docker-compose up -d

# O manual
odoo -c /etc/odoo/odoo.conf -d tu_base_datos
# Acceder: http://localhost:8069
```

## Arquitectura

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   Frontend Web (Next.js)    │     │  Frontend Móvil (Expo)       │
│  ┌─────────────────────┐  │     │  ┌─────────────────────┐   │
│  │ Seller │ Admin │Mod │  │     │  │ Products │ Cart │  │
│  └────────┬────────────┘  │     │  └────────┬──────────┘   │
│           │               │     │           │              │
│           ▼               │     │           ▼              │
│      API Calls (REST)      │     │     API Calls (REST)      │
└───────────┬───────────────┘     └───────────┬───────────────┘
            │                            │
            └──────────┬───────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend (Odoo 19)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Controladores API REST                    │   │
│  │  auth | users | products | services | companies     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Modelos Odoo                         │   │
│  │  billnova.user | res.company | product.product   │   │
│  └─────────────────────────────────────────────────┘   │
│                         ▼                            │
│             PostgreSQL Database                        │
└──────────────────────────────────────────────────────┘
```

## Estado del Proyecto

- [x] Autenticación completa con sesiones
- [x] Gestión de empresas
- [x] Gestión de productos (CRUD)
- [x] Gestión de servicios (CRUD)
- [x] Panel de vendedor
- [x] Panel de administrador
- [x] Panel de moderador
### Frontend Móvil
- [x] Autenticación (login/register)
- [x] Catálogo de productos
- [x] Carrito de compras
- [ ] Checkout y pago
- [ ] Órdenes
- [ ] Perfil de usuario

### Frontend Web
- [x] Autenticación completa con sesiones
- [x] Gestión de empresas
- [x] Gestión de productos (CRUD)
- [x] Gestión de servicios (CRUD)
- [x] Panel de vendedor
- [x] Panel de administrador
- [x] Panel de moderador
- [ ] Facturación (en desarrollo)
- [ ] Punto de venta (en desarrollo)
- [ ] Impuestos (en desarrollo)

## Notas

- El backend está configurado para ejecutarse en Docker
- La API usa autenticación por sesión con token
- Los logs de Odoo se encuentran en `/var/log/odoo/`
- **FrontendReactApp/App-Mobile** es la app móvil activa
- El contenido en `node_modules` dentro de App-Mobile son dependencias de Expo

---

**Versión:** 1.0.0  
**Última actualización:** 2026-04-20
