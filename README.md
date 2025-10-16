# Netflix Clone App 🎬

Una aplicación clone de Netflix desarrollada con React Native (Expo) para el frontend y Node.js/Express con PostgreSQL para el backend.

## Estructura del Proyecto

```
├── frontend/          # Aplicación React Native (Expo)
├── backend/           # Servidor Node.js/Express + PostgreSQL
├── .github/           # Configuración CI/CD (opcional)
├── .gitignore         # Archivos ignorados por Git
├── README.md          # Este archivo
└── package.json       # Scripts para gestionar ambos proyectos
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL
- Expo CLI (para desarrollo móvil)

## Instalación

### Opción 1: Instalación completa (recomendada)
```bash
# Instalar dependencias de ambos proyectos
npm run install:all
```

### Opción 2: Instalación individual
```bash
# Instalar dependencias del frontend
npm run install:frontend

# Instalar dependencias del backend
npm run install:backend
```

## Configuración

### Backend
1. Navega a la carpeta backend:
   ```bash
   cd backend
   ```

2. Copia el archivo de configuración:
   ```bash
   cp .env.example .env
   ```

3. Configura las variables de entorno en `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=netflixdb
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   JWT_SECRET=tu_jwt_secret
   PORT=3000
   ```

4. Configura la base de datos PostgreSQL:
   ```bash
   npm run setup-db
   ```

### Frontend
El frontend está configurado para conectarse al backend en `http://localhost:3000`. Si cambias el puerto del backend, actualiza las configuraciones correspondientes en los archivos de servicios.

## Desarrollo

### Ejecutar ambos proyectos simultáneamente
```bash
npm run dev
```

### Ejecutar proyectos individualmente

#### Frontend (React Native)
```bash
npm run dev:frontend
# o
cd frontend && npm start
```

#### Backend (Node.js/Express)
```bash
npm run dev:backend
# o
cd backend && npm run dev
```

## Scripts Disponibles

- `npm run install:all` - Instala dependencias de ambos proyectos
- `npm run dev` - Ejecuta frontend y backend simultáneamente
- `npm run dev:frontend` - Solo frontend
- `npm run dev:backend` - Solo backend
- `npm run build` - Construye el proyecto frontend
- `npm run test` - Ejecuta tests de ambos proyectos
- `npm run clean` - Limpia node_modules de ambos proyectos

## Tecnologías Utilizadas

### Frontend
- React Native (Expo)
- TypeScript
- Expo Router (navegación basada en archivos)
- Expo Components

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT para autenticación
- bcrypt para hash de contraseñas

## Funcionalidades

- 🔐 Autenticación de usuarios
- 👤 Gestión de perfiles múltiples
- 🎬 Catálogo de películas y series
- 🔍 Búsqueda de contenido
- 📱 Interfaz responsive
- 🎨 UI moderna inspirada en Netflix

## Desarrollo

Puedes comenzar a desarrollar editando los archivos en:
- **Frontend**: `frontend/app/` (usa enrutamiento basado en archivos)
- **Backend**: `backend/` (estructura de API REST)

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
