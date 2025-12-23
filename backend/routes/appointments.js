import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  completeAppointment,
  getCompletedAppointments,
  getBillingStats
} from '../data/db.js';

const router = express.Router();

// Obtener todos los slots disponibles
router.get('/slots', (req, res) => {
  try {
    const availableSlots = getAvailableSlots();
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo slots disponibles' });
  }
});

// Crear nueva cita
router.post('/appointments', async (req, res) => {
  try {
    const { slotId, date, time, clientName, clientId, service, serviceId, notes } = req.body;
    
    // Validar datos requeridos
    if (!slotId || !date || !time || !clientName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (!serviceId && !service) {
      return res.status(400).json({ error: 'Debe especificar un servicio' });
    }
    
    // Crear la cita
    const appointment = createAppointment({
      slotId,
      date,
      time,
      clientName,
      clientId: clientId || null,
      service: service || '',
      serviceId: serviceId || null,
      notes: notes || ''
    });
    
    res.status(201).json({
      message: 'Cita creada exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error creando la cita' });
  }
});

// Obtener todas las citas (para el dashboard)
router.get('/appointments', (req, res) => {
  try {
    const allAppointments = getAppointments();
    res.json(allAppointments);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo citas' });
  }
});

// Completar una cita con servicios realizados
router.patch('/appointments/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { serviciosRealizados, paymentMethod, cashReceived, change, clientId } = req.body;
    
    if (!serviciosRealizados || !Array.isArray(serviciosRealizados)) {
      return res.status(400).json({ error: 'Servicios realizados requeridos' });
    }
    
    const paymentData = {
      paymentMethod,
      cashReceived,
      change
    };
    
    const appointment = completeAppointment(id, serviciosRealizados, paymentData, clientId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    
    res.json({
      message: 'Cita completada',
      appointment
    });
  } catch (error) {
    console.error('Error completando cita:', error);
    res.status(500).json({ error: 'Error completando la cita' });
  }
});

// Obtener citas completadas (facturación)
router.get('/billing', (req, res) => {
  try {
    const completedAppointments = getCompletedAppointments();
    res.json(completedAppointments);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo facturación' });
  }
});

// Obtener estadísticas de facturación
router.get('/billing/stats', (req, res) => {
  try {
    const stats = getBillingStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;