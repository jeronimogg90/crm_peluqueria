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

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});
