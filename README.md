# SDN-STAFF

Sistema de Gestión de Eventos y Stands para Expositores

---

## Descripción General

SDN-STAFF es una plataforma integral para la gestión de eventos, stands, empresas expositoras y visitantes. Permite la administración de roles, asignación de stands, clasificación de expositores, favoritos, y mucho más, con una arquitectura moderna basada en Node.js (backend) y React (frontend).

---

## Estructura del Proyecto

```
SDN-STAFF/
├── backend/         # API RESTful en Node.js/Express y Sequelize
├── frontend/        # Aplicación web en React + Vite
├── docker-compose.yml
├── README.md        # (Este archivo)
└── ...
```

### Estructura principal de carpetas
- **backend/**: Código fuente del servidor, modelos, controladores, rutas, migraciones y seeders.
- **frontend/**: Código fuente del cliente, componentes, páginas, servicios y assets.

---

## Requisitos Previos

- Node.js >= 16.x
- npm >= 8.x
- MySQL >= 8.x
- Docker y Docker Compose (opcional, para despliegue rápido)

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd SDN-STAFF
```

### 2. Configurar variables de entorno

#### Backend
- Copia `.env.example` a `.env` en la carpeta `backend/` y ajusta los valores:
  - Credenciales de base de datos
  - JWT_SECRET, etc.

#### Frontend
- Copia `.env.example` a `.env` en la carpeta `frontend/sdn-staff/` y ajusta la URL de la API:
  - `VITE_API_URL=http://localhost:3000/api`

### 3. Instalar dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend/sdn-staff
npm install
```

---

## Base de Datos: Migraciones y Seeders

1. **Crear la base de datos:**
   - Ejecuta el script `setup-database.sql` en tu servidor MySQL.
2. **Ejecutar migraciones:**
   ```bash
   npx sequelize-cli db:migrate
   ```
3. **Cargar datos de ejemplo (seeders):**
   ```bash
   npx sequelize-cli db:seed:all
   ```

---

## Ejecución en Desarrollo

### Backend
```bash
cd backend
npm run dev
```
- Servidor en: `http://localhost:3000`

### Frontend
```bash
cd frontend/sdn-staff
npm run dev
```
- Aplicación en: `http://localhost:5173`

---

## Uso con Docker

```bash
docker-compose up --build
```
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---

## Variables de Entorno Importantes

### Backend (`backend/.env`)
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT`

### Frontend (`frontend/sdn-staff/.env`)
- `VITE_API_URL`

---

## Scripts Útiles

### Backend
- `npm run dev` — Inicia el servidor en modo desarrollo
- `npm run start` — Inicia el servidor en modo producción
- `npx sequelize-cli db:migrate` — Ejecuta migraciones
- `npx sequelize-cli db:seed:all` — Ejecuta seeders

### Frontend
- `npm run dev` — Inicia la app en modo desarrollo
- `npm run build` — Compila la app para producción
- `npm run preview` — Previsualiza la app compilada

---

## Testing

- (Opcional) Puedes agregar pruebas unitarias y de integración usando Jest, React Testing Library, etc.

---

## Despliegue

- Puedes desplegar usando Docker, o subir el backend y frontend a servidores separados.
- Ajusta las variables de entorno y configura los archivos `docker-compose.prod.yml` y `nginx.conf` según tu entorno de producción.

---

## Contacto y Soporte

- Autor: [Tu Nombre o Equipo]
- Email: [tu-email@dominio.com]
- Documentación adicional: revisa los archivos `README.md` en `backend/` y `frontend/` para detalles específicos de cada módulo.

---

¡Gracias por usar SDN-STAFF! Si tienes dudas, abre un issue o contacta al equipo de desarrollo. 