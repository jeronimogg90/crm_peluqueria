import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import appointmentsRouter from './routes/appointments.js';
import servicesRouter from './routes/services.js';
import clientsRouter from './routes/clients.js';
import googleCalendarRouter from './routes/googleCalendar.js';
import { getDb } from './database/database.js';

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

// Ruta temporal para migración de columnas de pago
app.get('/api/migrate-payment-columns', (req, res) => {
  try {
    const db = getDb();
    const columns = db.prepare(`PRAGMA table_info(appointments)`).all();
    const hasPaymentMethod = columns.some(col => col.name === 'payment_method');
    
    if (!hasPaymentMethod) {
      db.exec(`ALTER TABLE appointments ADD COLUMN payment_method TEXT`);
      db.exec(`ALTER TABLE appointments ADD COLUMN cash_received REAL`);
      db.exec(`ALTER TABLE appointments ADD COLUMN change_returned REAL`);
      res.json({ success: true, message: 'Columnas de pago agregadas exitosamente' });
    } else {
      res.json({ success: true, message: 'Las columnas de pago ya existen' });
    }
  } catch (error) {
    console.error('Error en migración:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta temporal para migración de columna client_id
app.get('/api/migrate-client-id', (req, res) => {
  try {
    const db = getDb();
    const columns = db.prepare(`PRAGMA table_info(appointments)`).all();
    const hasClientId = columns.some(col => col.name === 'client_id');
    
    if (!hasClientId) {
      db.exec(`ALTER TABLE appointments ADD COLUMN client_id INTEGER REFERENCES clients(id)`);
      res.json({ success: true, message: 'Columna client_id agregada exitosamente' });
    } else {
      res.json({ success: true, message: 'La columna client_id ya existe' });
    }
  } catch (error) {
    console.error('Error en migración:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 API disponible en http://localhost:${PORT}/api`);
});
