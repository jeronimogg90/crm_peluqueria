# Tarea 6: Actualizar server.js

## Objetivo
Limpiar server.js: eliminar import de SQLite, eliminar rutas de migracion inline.

## Fichero a modificar
`backend/server.js`

## Cambios

1. **Eliminar** la linea: `import { getDb } from './database/database.js';`
2. **Eliminar** la ruta `GET /api/migrate-payment-columns` (lineas 37-55)
3. **Eliminar** la ruta `GET /api/migrate-client-id` (lineas 58-74)
4. **Mantener** todo lo demas sin cambios

## Codigo completo del nuevo server.js

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import appointmentsRouter from './routes/appointments.js';
import servicesRouter from './routes/services.js';
import clientsRouter from './routes/clients.js';
import googleCalendarRouter from './routes/googleCalendar.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api', appointmentsRouter);
app.use('/api', servicesRouter);
app.use('/api', clientsRouter);
app.use('/api', googleCalendarRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Servir frontend en produccion
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});
```

## Criterios de aceptacion
- [ ] No hay import de database.js ni getDb
- [ ] No hay rutas de migracion (migrate-payment-columns, migrate-client-id)
- [ ] Health check se mantiene
- [ ] El servidor arranca correctamente
