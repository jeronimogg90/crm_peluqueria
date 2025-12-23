# 🚀 Desplegar PWA en Servidor

## Opción recomendada: Railway.app (Gratis/4€ mes)

### 1. Preparar el proyecto

```bash
# En la raíz del proyecto, crear estos archivos:
```

**railway.json** (en la raíz):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Dockerfile** (opcional, en la raíz):
```dockerfile
FROM node:20-alpine

# Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Frontend (build)
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Copiar build al backend para servir archivos estáticos
RUN cp -r dist/* /app/backend/public/

WORKDIR /app/backend
EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Modificar backend para servir el frontend

Edita `backend/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas API
import appointmentsRouter from './routes/appointments.js';
import servicesRouter from './routes/services.js';

app.use('/api', appointmentsRouter);
app.use('/api', servicesRouter);

// Servir archivos estáticos del frontend EN PRODUCCIÓN
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

### 3. Opciones de hosting

#### **A) Railway.app** (Recomendado - 4€/mes)

1. Crear cuenta en https://railway.app
2. Conectar GitHub
3. Subir el proyecto a GitHub
4. Importar desde Railway
5. Configurar variables de entorno:
   - `NODE_ENV=production`
6. Deploy automático ✅

#### **B) Render.com** (Gratis con limitaciones)

1. Crear cuenta en https://render.com
2. Nuevo "Web Service"
3. Conectar repositorio
4. Build command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
5. Start command: `cd backend && npm start`
6. Variables: `NODE_ENV=production`

#### **C) Fly.io** (~3€/mes)

```bash
# Instalar flyctl
brew install flyctl

# Login
flyctl auth login

# Iniciar app
flyctl launch

# Deploy
flyctl deploy
```

#### **D) VPS (DigitalOcean, Hetzner) - 4-5€/mes**

Más control pero requiere configuración manual.

### 4. Configurar HTTPS

Todos los servicios anteriores incluyen HTTPS automático (obligatorio para PWA).

### 5. Actualizar frontend

En `frontend/src/config/api.js`:

```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://tu-app.railway.app/api'  // URL de producción
  : 'http://localhost:3000/api';       // URL desarrollo

export default {
  get: (url) => fetch(`${API_URL}${url}`).then(r => r.json()),
  post: (url, data) => fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ... resto de métodos
};
```

### 6. Instalar en iPad

1. Abre Safari en el iPad
2. Ve a `https://tu-app.railway.app`
3. Toca el botón "Compartir" (cuadro con flecha)
4. Selecciona "Añadir a pantalla de inicio"
5. ¡Listo! La app está instalada como nativa

## 📱 Cómo funciona offline

El Service Worker cachea:
- HTML, CSS, JS
- Peticiones API recientes

**Limitación**: Necesita conexión inicial para cargar datos nuevos.

## 🔄 Actualizaciones

Simplemente haz push a GitHub → Railway despliega automáticamente.

## 💾 Backups de la base de datos

SQLite está en el servidor. Para backup:

1. Conecta por SSH al servidor
2. Copia el archivo `backend/database/peluqueria.db`
3. Guárdalo en local/nube

O programa backups automáticos con cron.

## 🆘 Soporte

Si hay problemas, revisa los logs en Railway/Render dashboard.
