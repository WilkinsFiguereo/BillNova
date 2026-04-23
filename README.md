# BillNova

Repositorio oficial: `https://github.com/WilkinsFiguereo/BillNova`

## Descripcion

BillNova es un sistema ERP con:

- frontend web en `Next.js`
- app mobile en `Expo / React Native`
- backend en `Odoo 19`
- base de datos en `PostgreSQL 15`

El backend Odoo de este proyecto esta configurado para trabajar solamente con la base de datos `wilkins`.

## Estructura del proyecto

```text
ProyectRijo/
|-- FrontendReactWeb/
|   `-- mi-app/
|-- FrontendReactApp/
|   `-- App-Mobile/
|-- odooBackend/
|   |-- addons/
|   |   `-- Proyect/
|   |-- config/
|   |   `-- odoo.conf
|   `-- docker-compose.yml
`-- README.md
```

## Requisitos

- `Node.js 20+`
- `npm 10+`
- `Docker`
- `Docker Compose`
- `Git`

## Configuracion importante del backend

La configuracion actual de Odoo ya fija la base de datos del proyecto:

- [odooBackend/config/odoo.conf](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/config/odoo.conf:7)

Valores clave:

```ini
db_name = wilkins
dbfilter = ^wilkins$
db_user = odoo
db_password = odoo
```

Eso significa:

- Odoo trabajara con la base `wilkins`
- el proyecto no debe quedarse usando otra base como `billnova`
- si en algun momento creaste otra base para pruebas, la base final a usar en este proyecto debe ser `wilkins`

## Paso a paso para levantar el proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/WilkinsFiguereo/BillNova.git
cd BillNova
```

Si ya tienes este proyecto abierto localmente, puedes continuar directamente.

## 2. Instalar dependencias del frontend web

```bash
cd FrontendReactWeb/mi-app
npm install
```

## 3. Instalar dependencias del frontend mobile

```bash
cd FrontendReactApp/App-Mobile
npm install
```

## 4. Correr Docker Compose para Odoo y PostgreSQL

Archivo usado:

- [odooBackend/docker-compose.yml](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/docker-compose.yml)

Desde la carpeta `odooBackend` ejecuta:

```bash
docker compose up -d
```

Si tu Docker aun usa el comando anterior, tambien funciona:

```bash
docker-compose up -d
```

Credenciales de PostgreSQL dentro de Docker:

- `POSTGRES_DB=postgres`
- `POSTGRES_USER=odoo`
- `POSTGRES_PASSWORD=odoo`

Contenedores esperados:

- `odoo-db`
- `odoo-web`

URL local de Odoo:

- `http://localhost:8079`

## 5. Crear la base de datos en Odoo

Si es la primera vez que levantas el proyecto:

1. abre `http://localhost:8079`
2. entra a la pantalla de creacion de base de datos
3. crea la base con el nombre `billnova` si necesitas completar la instalacion inicial de Odoo
4. despues ajusta el entorno para que el proyecto quede usando solo la base `wilkins`

Importante:

- la configuracion del proyecto en [odooBackend/config/odoo.conf](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/config/odoo.conf:7) deja fijo `db_name = wilkins`
- por lo tanto, para el uso normal del proyecto la base que debe existir y quedar operativa es `wilkins`
- si todavia no existe `wilkins`, creala y usala como base definitiva del proyecto

En resumen: para este proyecto deja Odoo trabajando solamente con la base `wilkins`.

## 6. Instalar el modulo custom en Odoo

Modulo:

- [odooBackend/addons/Proyect](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect)

Manifest:

- [odooBackend/addons/Proyect/__manifest__.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/__manifest__.py)

Paso a paso:

1. entra a Odoo con la base `wilkins`
2. activa el modo desarrollador
3. ve a `Apps`
4. pulsa `Update Apps List`
5. busca el modulo `BillNova` o `Proyect`
6. instala el modulo

Si el modulo ya estaba instalado y cambiaste codigo:

1. reinicia Odoo:

```bash
docker restart odoo-web
```

2. vuelve a Odoo
3. actualiza la lista de apps si hace falta
4. actualiza el modulo `BillNova / Proyect`

## 7. Configurar el correo en Odoo

El proyecto envia correos de:

- verificacion de cuenta
- recuperacion de contrasena
- invitaciones a empleados

Eso se usa desde el modelo:

- [odooBackend/addons/Proyect/models/users.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/models/users.py:116)

### 7.1. Configurar servidor saliente SMTP

En Odoo:

1. entra con un usuario administrador
2. ve a `Settings`
3. activa modo desarrollador si aun no esta activo
4. entra a `Technical -> Email -> Outgoing Mail Servers`
5. crea o edita un servidor SMTP

Campos recomendados:

- `Description`: nombre libre, por ejemplo `SMTP BillNova`
- `SMTP Server`: host de tu proveedor de correo
- `SMTP Port`: el puerto de tu proveedor
- `Connection Security`: `TLS/STARTTLS` o `SSL/TLS`
- `Username`: tu correo SMTP
- `Password`: tu clave o app password
- `From Filtering`: opcional

Luego:

1. guarda
2. pulsa `Test Connection`
3. confirma que el test responda correctamente

### 7.2. Configurar correo remitente por defecto

En Odoo entra a:

- `Settings -> Technical -> Parameters -> System Parameters`

Crea o revisa este parametro:

```text
mail.default.from=tu-correo@tudominio.com
```

El modulo usa ese valor como remitente. Si no existe, intenta usar el correo de la compania en Odoo y, como ultimo fallback, usa `no-reply@billnova.local`.

### 7.3. Probar verificacion y recuperacion

Endpoints relacionados:

- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-code`
- `POST /api/auth/reset-password`

Controlador:

- [odooBackend/addons/Proyect/controllers/auth_controller.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/controllers/auth_controller.py:1211)

## 8. Configurar auth en Odoo

El proyecto maneja dos tipos de autenticacion:

- login normal con correo y contrasena
- Google OAuth

Controlador principal:

- [odooBackend/addons/Proyect/controllers/auth_controller.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/controllers/auth_controller.py:1)

## 8.1. Auth normal

No requiere una configuracion externa especial aparte de:

- tener la base `wilkins`
- tener el modulo `BillNova / Proyect` instalado
- tener usuarios creados en `billnova.user` y `res.users`
- tener el correo configurado si quieres verificacion y reset de contrasena

Endpoints principales:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/session`
- `POST /api/auth/logout`

## 8.2. Configurar Google OAuth

El modulo depende de `auth_oauth`, segun el manifest del modulo.

Primero debes crear tus credenciales en Google Cloud.

Despues, en Odoo:

1. entra a `Settings -> Technical -> Parameters -> System Parameters`
2. crea o revisa estos parametros:

```text
web.base.url=http://localhost:8079
billnova.google_oauth_client_id=TU_CLIENT_ID
billnova.google_oauth_client_secret=TU_CLIENT_SECRET
```

Opcionales:

```text
billnova.google_oauth_token_endpoint=https://oauth2.googleapis.com/token
billnova.google_oauth_userinfo_endpoint=https://openidconnect.googleapis.com/v1/userinfo
```

Ademas, revisa que el proveedor OAuth de Google exista en Odoo si lo vas a manejar por interfaz:

1. `Settings -> Technical -> Authentication -> OAuth Providers`
2. crea o valida un proveedor de Google
3. verifica que tenga `client_id`, `client_secret` y endpoint de autorizacion

El backend tambien puede tomar la configuracion desde esos parametros del sistema aunque no dependas solo del registro visual del proveedor.

### Callback usado por el backend

El callback que construye el proyecto es:

```text
http://localhost:8079/api/auth/google/mobile/callback
```

Si publicas Odoo en otra URL, cambia `web.base.url` para que el callback generado sea correcto.

### Endpoints Google OAuth

- `GET /api/auth/google/mobile/authorize-url`
- `GET /api/auth/google/mobile/callback`

## 9. Configurar frontend web

Archivo recomendado:

- `FrontendReactWeb/mi-app/.env.local`

Contenido:

```env
NEXT_PUBLIC_ODOO_URL=http://localhost:8079
```

Luego ejecuta:

```bash
cd FrontendReactWeb/mi-app
npm run dev
```

Abre:

```text
http://localhost:3000
```

## 10. Configurar frontend mobile

Archivo recomendado:

- `FrontendReactApp/App-Mobile/.env`

Contenido:

```env
EXPO_PUBLIC_ODOO_URL=http://localhost:8079
```

Luego ejecuta:

```bash
cd FrontendReactApp/App-Mobile
npx expo start
```

Si pruebas desde un telefono fisico, no uses `localhost`; usa una IP local accesible o un tunel.

## Resumen rapido del flujo correcto

1. instalar dependencias web y mobile
2. correr `docker compose up -d` en `odooBackend`
3. entrar a Odoo en `http://localhost:8079`
4. dejar operativa la base `wilkins`
5. instalar el modulo `BillNova / Proyect`
6. configurar SMTP en Odoo
7. configurar `mail.default.from`
8. configurar `web.base.url`
9. configurar Google OAuth si se usara login con Google
10. correr frontend web y/o mobile

## Archivos clave

- [README.md](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/README.md)
- [odooBackend/docker-compose.yml](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/docker-compose.yml)
- [odooBackend/config/odoo.conf](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/config/odoo.conf)
- [odooBackend/addons/Proyect/__manifest__.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/__manifest__.py)
- [odooBackend/addons/Proyect/controllers/auth_controller.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/controllers/auth_controller.py)
- [odooBackend/addons/Proyect/models/users.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/models/users.py)

## Nota final sobre la base de datos

Aunque durante una instalacion inicial puedas llegar a crear una base `billnova`, la configuracion final del proyecto debe quedar usando solamente la base de Odoo `wilkins`.
