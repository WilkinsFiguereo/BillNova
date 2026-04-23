# BillNova

Sistema ERP con frontend web en Next.js, app movil en Expo/React Native y backend en Odoo.

## Estructura

```text
ProyectRijo/
|-- FrontendReactWeb/
|   `-- mi-app/                  # Next.js web app
|-- FrontendReactApp/
|   `-- App-Mobile/              # Expo mobile app
|-- odooBackend/
|   |-- addons/Proyect/          # Modulo Odoo custom
|   `-- docker-compose.yml
`-- README.md
```

## Stack

| Capa | Tecnologia |
| --- | --- |
| Frontend web | Next.js, React 19, TypeScript |
| Frontend movil | Expo SDK 54, React Native 0.81, Expo Router |
| Backend | Odoo, Python |
| Base de datos | PostgreSQL |

## Ejecucion

### Web

```bash
cd FrontendReactWeb/mi-app
npm install
npm run dev
```

### Mobile

```bash
cd FrontendReactApp/App-Mobile
npm install
npx expo start
```

### Odoo

```bash
cd odooBackend
docker-compose up -d
```

Despues de tocar el modulo `Proyect`, reinicia Odoo y actualiza el modulo.

## Variables y parametros

### Frontend web

`FrontendReactWeb/mi-app/.env.local`

```env
NEXT_PUBLIC_ODOO_URL=https://tu-url-publica-de-odoo
```

### Frontend movil

`FrontendReactApp/App-Mobile/.env`

```env
EXPO_PUBLIC_ODOO_URL=https://tu-url-publica-de-odoo
```

### Odoo system parameters

Configura estos parametros en `Settings -> Technical -> Parameters -> System Parameters`:

```text
web.base.url=https://tu-url-publica-de-odoo
billnova.google_oauth_client_id=TU_CLIENT_ID
billnova.google_oauth_client_secret=TU_CLIENT_SECRET
```

Tambien puede leer `client_id` desde `auth.oauth.provider`, pero el `client_secret` debe existir en el provider o en los parametros anteriores.

## Autenticacion

### Endpoints principales

| Endpoint | Metodo | Uso |
| --- | --- | --- |
| `/api/auth/login` | POST | Login usuario/password |
| `/api/auth/register` | POST | Registro |
| `/api/auth/session` | GET | Restaurar sesion |
| `/api/auth/logout` | POST | Cerrar sesion |
| `/api/auth/verify-email` | POST | Verificar correo |
| `/api/auth/resend-code` | POST | Reenviar verificacion |
| `/api/auth/google/mobile/authorize-url` | GET | Construye URL OAuth para web y mobile |
| `/api/auth/google/mobile/callback` | GET | Callback OAuth de Google |

### Sesion

- Web y mobile usan `session_token` de Odoo.
- Las peticiones autenticadas envian `X-Auth-Session`.
- En mobile el token se guarda con `expo-secure-store`.
- En web el estado se persiste en `localStorage` o `sessionStorage`.

## Google OAuth

### Redirect URI oficial

Si tu `web.base.url` es:

```text
https://jwfn4vcd-8079.use2.devtunnels.ms
```

entonces la redirect URI autorizada en Google Cloud debe ser:

```text
https://jwfn4vcd-8079.use2.devtunnels.ms/api/auth/google/mobile/callback
```

### Configuracion en Google Cloud

1. Crear un OAuth Client de tipo `Web application`.
2. En `Authorized redirect URIs`, agregar:

```text
https://TU_WEB_BASE_URL/api/auth/google/mobile/callback
```

3. Si el consentimiento esta en `Testing`, agregar tu correo en `Test users`.

### Configuracion en Odoo

1. Instalar `auth_oauth`.
2. Activar el provider de Google si lo usas.
3. Verificar que el backend encuentre:
   - `client_id`
   - `client_secret`
   - `web.base.url`

### Como funciona el flujo

#### Mobile

1. La app pide a Odoo `/api/auth/google/mobile/authorize-url`.
2. Odoo devuelve la URL final de Google.
3. La app abre Google.
4. Google vuelve a `/api/auth/google/mobile/callback`.
5. Odoo valida el token y devuelve una pagina puente que reabre la app con el deep link.
6. La app recibe `session_token`, guarda sesion y entra al home.

#### Web

1. La pagina de login/register pide a Odoo `/api/auth/google/mobile/authorize-url`.
2. El navegador va a Google.
3. Google vuelve a `/api/auth/google/mobile/callback`.
4. Odoo valida y redirige otra vez al login/register web con `ok`, `uid`, `session_token`, `role`, etc.
5. El frontend web persiste la sesion y redirige al dashboard correcto.

## Cambios recientes

### Routing y auth mobile

- Se corrigio el enrutado inicial de Expo Router para que entre a `auth` o `tabs` segun sesion.
- Se corrigieron rutas inconsistentes como `/login` y `/(auth)`.
- Se ajusto logout y retorno desde registro.

### Sesion mobile

- `AuthProvider` ahora guarda `session_token`.
- `odooClient` envia `X-Auth-Session` en las requests autenticadas.
- Se agregaron mensajes de error visibles para OAuth.
- Se separo el loading de Google del loading de login normal.

### Google OAuth backend

- Se agrego soporte a `auth_oauth` en el modulo Odoo.
- Se implementaron:
  - `/api/auth/google/mobile/authorize-url`
  - `/api/auth/google/mobile/callback`
- El backend crea o actualiza el usuario BillNova/Odoo despues del login con Google.
- Se agregaron logs detallados del flujo OAuth.
- Se agrego una pagina puente para devolver deep links a la app y evitar `404` al volver desde Odoo.

### Google OAuth frontend web

- Se agrego boton `Continuar con Google` en:
  - login web
  - register web
- El frontend web ya procesa el callback OAuth y persiste la sesion sin pasar manualmente por Odoo.

## Archivos clave tocados en estos cambios

- [FrontendReactApp/App-Mobile/app/_layout.tsx](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactApp/App-Mobile/app/_layout.tsx)
- [FrontendReactApp/App-Mobile/app/index.tsx](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactApp/App-Mobile/app/index.tsx)
- [FrontendReactApp/App-Mobile/src/core/providers/AuthProvider.tsx](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactApp/App-Mobile/src/core/providers/AuthProvider.tsx)
- [FrontendReactApp/App-Mobile/src/core/api/odooClient.ts](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactApp/App-Mobile/src/core/api/odooClient.ts)
- [FrontendReactWeb/mi-app/app/navigation/auth/login/page/page.tsx](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactWeb/mi-app/app/navigation/auth/login/page/page.tsx)
- [FrontendReactWeb/mi-app/src/features/auth/login/hooks/useGoogleOAuth.ts](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactWeb/mi-app/src/features/auth/login/hooks/useGoogleOAuth.ts)
- [FrontendReactWeb/mi-app/src/features/auth/register/index.tsx](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/FrontendReactWeb/mi-app/src/features/auth/register/index.tsx)
- [odooBackend/addons/Proyect/controllers/auth_controller.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/controllers/auth_controller.py)
- [odooBackend/addons/Proyect/__manifest__.py](/c:/Users/Wilkins1209/Desktop/Proyects/ProyectRijo/odooBackend/addons/Proyect/__manifest__.py)

## Verificacion recomendada

### Mobile

1. Abrir app.
2. Pulsar `Continuar con Google`.
3. Elegir cuenta.
4. Confirmar que vuelve al home y queda sesion activa.

### Web

1. Ir a `/navigation/auth/login`.
2. Pulsar `Continuar con Google`.
3. Elegir cuenta.
4. Confirmar redireccion al dashboard segun rol.

### Backend

Buscar en logs de Odoo:

```text
GOOGLE OAUTH CONFIG
GOOGLE AUTHORIZE URL
GOOGLE CALLBACK
GOOGLE MOBILE redirecting via bridge page
```
