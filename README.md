# BillNova

Repositorio oficial: `https://github.com/WilkinsFiguereo/BillNova`

## Nombre del Proyecto

`BillNova`

## Descripción del Proyecto

BillNova es un sistema ERP orientado a la gestión comercial y operativa de empresas instaladoras. El proyecto integra:

- un frontend web administrativo en `Next.js`
- una app mobile en `Expo / React Native`
- un backend ERP en `Odoo`
- base de datos `PostgreSQL`

El sistema permite autenticación tradicional y con Google, gestión de usuarios, productos, servicios, categorías, empresas, facturación, reportes, moderación y paneles por rol.

## Repositorio del Proyecto

- GitHub: `https://github.com/WilkinsFiguereo/BillNova`

### Clonar repositorio de GitHub

```bash
git clone https://github.com/WilkinsFiguereo/BillNova.git
cd BillNova
```

## Tecnologías Utilizadas

### Frontend Web

- `Next.js 16`
- `React 19`
- `TypeScript`
- `React Hook Form`
- `Lucide React`
- `jsPDF`
- `xlsx`

### App Mobile

- `Expo SDK 54`
- `React Native 0.81`
- `Expo Router`
- `Expo Secure Store`
- `Expo Sharing`
- `React Navigation`
- `Zustand`

### Backend

- `Odoo 19`
- `Python`
- `PostgreSQL 15`
- `Docker / Docker Compose`

### Integraciones

- `Google OAuth`
- API REST personalizada sobre Odoo

## Características del Sistema

- Inicio de sesión con usuario/contraseña
- Inicio de sesión con Google OAuth
- Persistencia de sesión en web y mobile
- Registro de usuarios y empresas
- Gestión de productos
- Gestión de servicios
- Gestión de categorías
- Gestión de empresas
- Gestión de facturas
- Exportación de facturas a PDF y Excel
- Compartir facturas por correo
- Dashboard para admin
- Dashboard para seller
- Dashboard y herramientas de moderación
- Control de acceso por roles
- Configuración por tipo de usuario

## Requisitos del Sistema

### Requisitos generales

- `Node.js 20+`
- `npm 10+`
- `Docker`
- `Docker Compose`
- `Git`

### Requisitos recomendados

- Navegador moderno
- Android Studio o Expo Go para pruebas mobile
- Acceso a Google Cloud Console si se usará OAuth de Google

## Estructura del Proyecto

```text
BillNova/
|-- FrontendReactWeb/
|   `-- mi-app/                  # Aplicación web en Next.js
|-- FrontendReactApp/
|   `-- App-Mobile/              # Aplicación móvil en Expo
|-- odooBackend/
|   |-- addons/
|   |   `-- Proyect/             # Módulo custom principal de Odoo
|   |-- config/                  # Configuración de Odoo
|   `-- docker-compose.yml       # Infraestructura local de backend
`-- README.md
```

## Configuración

## Configuración del frontend web

Archivo sugerido: `FrontendReactWeb/mi-app/.env.local`

```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8079
```

## Configuración del frontend mobile

Archivo sugerido: `FrontendReactApp/App-Mobile/.env`

```env
EXPO_PUBLIC_ODOO_URL=http://localhost:8079
```

Si se prueba en dispositivo físico, usa una URL accesible desde el teléfono, por ejemplo una IP local o túnel público.

## Configuración de Odoo

Levanta Odoo con Docker usando el archivo:

- [odooBackend/docker-compose.yml](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/docker-compose.yml)

Credenciales por defecto de PostgreSQL dentro de Docker:

- `POSTGRES_DB=postgres`
- `POSTGRES_USER=odoo`
- `POSTGRES_PASSWORD=odoo`

Odoo queda expuesto localmente en:

- `http://localhost:8079`

### Parámetros del sistema en Odoo

En `Settings -> Technical -> Parameters -> System Parameters`, configurar al menos:

```text
web.base.url=http://localhost:8079
billnova.google_oauth_client_id=TU_CLIENT_ID
billnova.google_oauth_client_secret=TU_CLIENT_SECRET
```

## Instalación del Proyecto

## 1. Instalar dependencias del frontend web

```bash
cd FrontendReactWeb/mi-app
npm install
```

## 2. Instalar dependencias del frontend mobile

```bash
cd FrontendReactApp/App-Mobile
npm install
```

## 3. Levantar backend Odoo + PostgreSQL

```bash
cd odooBackend
docker-compose up -d
```

## 4. Instalar o actualizar el módulo custom

Una vez que Odoo esté corriendo:

1. entra al panel de Odoo
2. activa modo desarrollador
3. actualiza la lista de aplicaciones
4. instala o actualiza el módulo `BillNova / Proyect`

Si cambias código Python o controladores, reinicia el contenedor de Odoo:

```bash
docker restart odoo-web
```

## Paso de ejecución del proyecto paso a paso

## Backend Odoo

1. Abre una terminal en `odooBackend`
2. Ejecuta:

```bash
docker-compose up -d
```

3. Verifica que el backend esté arriba en `http://localhost:8079`
4. Si es la primera vez, crea o selecciona una base de datos en Odoo
5. Instala el módulo custom `Proyect`

## Frontend web

1. Abre otra terminal
2. Entra a:

```bash
cd FrontendReactWeb/mi-app
```

3. Ejecuta:

```bash
npm run dev
```

4. Abre:

```text
http://localhost:3000
```

## App mobile

1. Abre otra terminal
2. Entra a:

```bash
cd FrontendReactApp/App-Mobile
```

3. Ejecuta:

```bash
npx expo start
```

4. Elige una opción:

- `a` para Android
- `i` para iOS
- `w` para web
- o escanea QR con Expo Go

## Uso del Sistema

## Flujo básico

1. Inicia el backend Odoo
2. Inicia el frontend web o mobile
3. Accede con un usuario existente o crea uno nuevo
4. Según el rol, el sistema redirige a:

- `admin`
- `moderator`
- `seller`
- `gerente`
- `worker`

## Roles principales

### Admin

- Dashboard administrativo
- Usuarios
- Empresas
- Productos
- Categorías
- Reportes
- Configuración

### Moderator

- Dashboard de moderación
- Moderación de productos y empresas
- Reportes
- Configuración

### Seller

- Dashboard comercial
- Productos
- Servicios
- Facturas
- Pedidos POS
- Impuestos
- Configuración de empresa

## Credenciales relevantes

## Relevantes para desarrollo local

### PostgreSQL Docker

- Usuario: `odoo`
- Contraseña: `odoo`
- Base inicial: `postgres`

### Odoo local

- URL: `http://localhost:8079`
- La credencial de administrador funcional depende de la base creada en tu entorno

### Variables necesarias

- `NEXT_PUBLIC_ODOO_URL`
- `EXPO_PUBLIC_ODOO_URL`
- `web.base.url`
- `billnova.google_oauth_client_id`
- `billnova.google_oauth_client_secret`

Nota: no se incluyen credenciales privadas del sistema en este documento. Deben configurarse en cada entorno.

## API utilizada y su implementación paso a paso

BillNova usa una API REST personalizada construida sobre controladores de Odoo dentro de:

- [odooBackend/addons/Proyect/controllers](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/controllers)

## Endpoints importantes

### Autenticación

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-code`

### Google OAuth

- `GET /api/auth/google/mobile/authorize-url`
- `GET /api/auth/google/mobile/callback`

### Funcionales

- `GET /api/products`
- `GET /api/mobile/products`
- `GET /api/services`
- `GET /api/categories`
- `GET /api/pos/orders`
- `GET /api/companies`
- `GET /api/admin/dashboard/financial`

## Implementación paso a paso de la API en el sistema

### 1. Backend Odoo expone endpoints HTTP

Los endpoints se implementan en controladores como:

- `auth_controller.py`
- `product_controller.py`
- `service_controller.py`
- `pos_controller.py`
- `company_controller.py`

### 2. El frontend consume esos endpoints

En web:

- usando `fetch`
- usando helpers como `odooGet`, `odooPost`, `odooPut`, `odooDelete`

Archivo base:

- [FrontendReactWeb/mi-app/src/lib/odooApi.ts](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactWeb/mi-app/src/lib/odooApi.ts)

En mobile:

- usando un cliente HTTP central que adjunta `X-Auth-Session`

### 3. La sesión se mantiene con token de Odoo

- Odoo genera `session_token`
- web lo guarda en `localStorage` o `sessionStorage`
- mobile lo guarda en `SecureStore`
- las requests autenticadas envían `X-Auth-Session`

### 4. Google OAuth

Flujo resumido:

1. frontend pide `authorize-url`
2. backend arma la URL de Google
3. el usuario autoriza
4. Google vuelve al callback de Odoo
5. Odoo valida el acceso
6. Odoo devuelve sesión y datos del usuario
7. frontend persiste sesión y redirige según el rol

## Características técnicas relevantes de la API

- CORS manejado desde controladores Odoo
- sesión por token
- endpoints especializados para web y mobile cuando aplica
- control de alcance por rol y empresa
- integración con reportes, POS y facturación de Odoo

## Archivos clave del sistema

- [README.md](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/README.md)
- [FrontendReactWeb/mi-app/package.json](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactWeb/mi-app/package.json)
- [FrontendReactApp/App-Mobile/package.json](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactApp/App-Mobile/package.json)
- [odooBackend/addons/Proyect/__manifest__.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/__manifest__.py)
- [odooBackend/docker-compose.yml](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/docker-compose.yml)

## Autores del Desarrollo

- `Wilkins Figuereo`
- `Yeraldo Novas`
- `Daury Contreras`

## Autor de administración del proyecto

- `Rijo`

## Notas finales

- Si cambias controladores o modelos de Odoo, reinicia `odoo-web`
- Si cambias el módulo custom, actualízalo desde Odoo
- Si usas Google OAuth, asegúrate de registrar correctamente el callback
- Si pruebas en móvil físico, no uses `localhost`; usa IP local o túnel público
