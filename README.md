# Netflix Clone App 🎬

Una aplicación clone de Netflix desarrollada con React Native (Expo) para el frontend y Node.js/Express con PostgreSQL para el backend, integrada con TMDB API para contenido real.

## 📋 Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de Datos](#base-de-datos)
- [Desarrollo](#desarrollo)
- [Integración TMDB](#integración-tmdb)
- [Scripts Disponibles](#scripts-disponibles)
- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)

## 🏗️ Estructura del Proyecto

```
├── frontend/          # Aplicación React Native (Expo)
│   ├── app/          # Rutas y pantallas (Expo Router)
│   ├── components/   # Componentes reutilizables
│   ├── services/     # Servicios API (backend y TMDB)
│   ├── contexts/     # Contextos de React
│   └── .env         # Variables de entorno del frontend
├── backend/          # Servidor Node.js/Express + PostgreSQL
│   ├── src/         # Código fuente del backend
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── services/     # Lógica de negocio
│   │   ├── routes/       # Definición de rutas
│   │   ├── config/       # Configuración (DB, JWT, etc.)
│   │   └── middlewares/  # Middlewares (auth, etc.)
│   ├── database/    # Scripts de base de datos
│   └── .env        # Variables de entorno del backend
├── .gitignore      # Archivos ignorados por Git
└── README.md       # Este archivo
```

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **PostgreSQL** >= 12.0
- **Expo CLI** (para desarrollo móvil)
- **Cuenta TMDB** (para API key)

## 🚀 Instalación

### Paso 1: Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd app-netflix-puyo
```

### Paso 2: Instalar dependencias del Backend
```bash
cd backend
npm install
```

### Paso 3: Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

## ⚙️ Configuración

### 1. Configuración del Backend

**Paso 1:** Navega a la carpeta backend
```bash
cd backend
```

**Paso 2:** Crea el archivo de configuración
```bash
copy .env.example .env
```

**Paso 3:** Abre el archivo `backend/.env` y configura lo siguiente:
```env
# Configuración de Base de Datos
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/netflixdb

# Configuración del Servidor
JWT_SECRET=mi_clave_secreta_super_segura_123
PORT=4000
NODE_ENV=development
```

> **Importante:** Cambia `tu_contraseña` por la contraseña de tu PostgreSQL

### 2. Configuración del Frontend

**Paso 1:** Navega a la carpeta frontend
```bash
cd ../frontend
```

**Paso 2:** Crea el archivo `.env` en la carpeta frontend con el siguiente contenido:
```env
# API de TMDB (YA CONFIGURADA - NO CAMBIAR)
EXPO_PUBLIC_TMDB_API_KEY=90d95a7bdb9767410b36ac945235fc4a

# Configuración del Backend (CAMBIAR POR TU IP)
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000
API_BASE_URL=http://TU_IP_LOCAL:4000
```

> **Importante:** Reemplaza `TU_IP_LOCAL` por tu dirección IP local (ejemplo: `192.168.1.100`)

**Para encontrar tu IP local:**
- **Windows:** Abre CMD y escribe `ipconfig`
- **Mac/Linux:** Abre Terminal y escribe `ifconfig`

## 🗄️ Base de Datos

### Configuración de PostgreSQL

**Paso 1:** Instala PostgreSQL en tu computadora
- Descarga desde: https://www.postgresql.org/download/
- Durante la instalación, recuerda la contraseña que pongas para el usuario `postgres`

**Paso 2:** Abre pgAdmin o la consola de PostgreSQL y ejecuta:
```sql
CREATE DATABASE netflixdb;
```

**Paso 3:** Configura las tablas de la base de datos
```bash
cd backend
npm run setup-db
```

> **Nota:** Este comando creará automáticamente todas las tablas necesarias y cargará datos de ejemplo

### 📊 Esquema de Base de Datos

El proyecto utiliza **9 tablas principales**:

#### **Autenticación y Perfiles**
- **`users`** - Usuarios registrados en la aplicación
- **`profiles`** - Perfiles múltiples por usuario (máximo 5 por cuenta)

#### **Contenido Local**
- **`content`** - Películas y series del catálogo local
- **`content_categories`** - Categorías (Tendencias, Acción, Comedia, etc.)
- **`content_category_mapping`** - Relación entre contenido y categorías
- **`episodes`** - Episodios de las series

#### **Funcionalidades de Usuario**
- **`user_content_progress`** - Progreso de visualización de cada usuario
- **`user_watchlist`** - "Mi Lista" personal de cada perfil
- **`tmdb_watchlist`** - Lista de películas favoritas de TMDB

## 🔧 Desarrollo

### Ejecutar el proyecto

**Opción 1: Ejecutar Backend y Frontend por separado (Recomendado)**

1. **Ejecutar el Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   El backend se ejecutará en: `http://localhost:4000`

2. **Ejecutar el Frontend (en otra terminal):**
   ```bash
   cd frontend
   npm start
   ```
   Expo abrirá automáticamente en tu navegador

**Opción 2: Ejecutar ambos simultáneamente**
```bash
npm run dev
```

### URLs de Desarrollo
- **Backend API:** `http://localhost:4000`
- **Frontend:** Expo DevTools (puerto dinámico)
- **Base de Datos:** PostgreSQL en puerto 5432

## 🎬 Integración TMDB

### ¿Qué es TMDB?
TMDB (The Movie Database) es una base de datos de películas y series que nos proporciona información real sobre miles de títulos, incluyendo imágenes, descripciones, reparto, y más.

### Funcionalidades Disponibles

#### 🎭 Películas
- **Películas populares** - Las más vistas actualmente
- **Mejor valoradas** - Las mejores según los usuarios
- **En cartelera** - Películas que están en cines
- **Próximos estrenos** - Películas que se estrenarán pronto
- **Búsqueda** - Buscar cualquier película por nombre

#### 📺 Series de TV
- **Series populares** - Las más vistas
- **Mejor valoradas** - Las mejores series
- **Al aire** - Series que están transmitiéndose
- **Información completa** - Temporadas, episodios, reparto

#### 🔍 Búsqueda y Filtros
- **Búsqueda general** - Buscar películas y series al mismo tiempo
- **Filtros por género** - Acción, Comedia, Drama, etc.
- **Mi Lista TMDB** - Guardar tus películas favoritas

### Configuración Automática
✅ **La API de TMDB ya está configurada y lista para usar**
- No necesitas crear cuenta en TMDB
- No necesitas obtener tu propia API key
- Todo está listo para funcionar

### Ejemplo de Uso
```typescript
// Los servicios ya están configurados en el proyecto
import { getPopularMovies } from '../services/tmdb';

// Obtener películas populares
const movies = await getPopularMovies(1);
```

## 📜 Scripts Disponibles

### Scripts Principales
```bash
# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend  
cd frontend && npm install

# Ejecutar solo el backend
cd backend && npm run dev

# Ejecutar solo el frontend
cd frontend && npm start

# Configurar la base de datos
cd backend && npm run setup-db
```

### Scripts Adicionales (Opcionales)
```bash
# Ejecutar ambos proyectos a la vez
npm run dev

# Limpiar node_modules de ambos proyectos
npm run clean

# Construir el proyecto frontend
npm run build
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** (Expo)
- **TypeScript**
- **Expo Router** (navegación basada en archivos)
- **Expo Components**
- **Context API** (gestión de estado)

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **dotenv** para variables de entorno

### APIs Externas
- **TMDB API** - The Movie Database para contenido real

## ✨ Funcionalidades

### 🔐 Autenticación
- Registro y login de usuarios
- Autenticación JWT
- Middleware de autenticación

### 👤 Gestión de Perfiles
- Hasta 5 perfiles por usuario
- Perfiles para niños
- Avatares personalizables

### 🎬 Catálogo de Contenido
- **Contenido local:** Películas y series almacenadas
- **Contenido TMDB:** Miles de películas y series reales
- **Categorías:** Organización por géneros
- **Búsqueda:** Búsqueda en ambos catálogos

### 📱 Funcionalidades de Usuario
- **"Mi Lista":** Watchlist personal por perfil
- **Continuar viendo:** Seguimiento de progreso
- **Recomendaciones:** Basadas en historial
- **Progreso de visualización:** Guardado automático

### 🎨 Interfaz de Usuario
- **UI moderna:** Inspirada en Netflix
- **Responsive:** Adaptable a diferentes pantallas
- **Navegación fluida:** Expo Router
- **Componentes reutilizables:** Arquitectura modular

## 🚀 Desarrollo y Contribución

### Estructura de Desarrollo
- **Frontend:** `frontend/app/` (enrutamiento basado en archivos)
- **Backend:** `backend/src/` (estructura de API REST)

### Flujo de Desarrollo
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🐛 Solución de Problemas

### Problemas Comunes y Soluciones

#### 1. **Error: "No se puede conectar a la base de datos"**
**Solución:**
- Verifica que PostgreSQL esté ejecutándose en tu computadora
- Revisa que la contraseña en `backend/.env` sea correcta
- Asegúrate de haber creado la base de datos `netflixdb`

#### 2. **Error: "Cannot connect to backend"**
**Solución:**
- Verifica que el backend esté ejecutándose (`cd backend && npm run dev`)
- Revisa que la IP en `frontend/.env` sea correcta
- Asegúrate de que ambas computadoras estén en la misma red WiFi

#### 3. **Error: "TMDB API not working"**
**Solución:**
- No cambies la API key que está en el archivo
- Verifica tu conexión a internet
- Reinicia la aplicación

#### 4. **Error: "npm install fails"**
**Solución:**
```bash
# Limpia la caché de npm
npm cache clean --force

# Borra node_modules y reinstala
rm -rf node_modules
npm install
```

#### 5. **Error: "Expo no abre"**
**Solución:**
- Instala Expo CLI globalmente: `npm install -g @expo/cli`
- Reinicia la terminal
- Ejecuta `cd frontend && npm start`

### Comandos de Ayuda
```bash
# Ver si PostgreSQL está ejecutándose (Windows)
net start postgresql*

# Ver procesos en puerto 4000
netstat -ano | findstr :4000

# Reiniciar todo desde cero
cd backend && npm run setup-db
cd ../frontend && npm start
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para el aprendizaje de desarrollo full-stack**
