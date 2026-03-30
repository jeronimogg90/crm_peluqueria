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

router.get('/slots', async (req, res) => {
  try {
    const availableSlots = await getAvailableSlots();
    res.json(availableSlots);
  } catch (error) {
    console.error('Error obteniendo slots:', error);
    res.status(500).json({ error: 'Error obteniendo slots disponibles' });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const { slotId, date, time, clientName, clientId, service, serviceId, notes } = req.body;

    if (!slotId || !date || !time || !clientName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    if (!serviceId && !service) {
      return res.status(400).json({ error: 'Debe especificar un servicio' });
    }

    const appointment = await createAppointment({
      slotId, date, time, clientName,
      clientId: clientId || null,
      service: service || '',
      serviceId: serviceId || null,
      notes: notes || ''
    });

    res.status(201).json({ message: 'Cita creada exitosamente', appointment });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error creando la cita' });
  }
});

router.get('/appointments', async (req, res) => {
  try {
    const allAppointments = await getAppointments();
    res.json(allAppointments);
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ error: 'Error obteniendo citas' });
  }
});

router.patch('/appointments/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { serviciosRealizados, paymentMethod, cashReceived, change, clientId } = req.body;

    if (!serviciosRealizados || !Array.isArray(serviciosRealizados)) {
      return res.status(400).json({ error: 'Servicios realizados requeridos' });
    }

    const paymentData = { paymentMethod, cashReceived, change };
    const appointment = await completeAppointment(id, serviciosRealizados, paymentData, clientId);

    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita completada', appointment });
  } catch (error) {
    console.error('Error completando cita:', error);
    res.status(500).json({ error: 'Error completando la cita' });
  }
});

router.get('/billing', async (req, res) => {
  try {
    const completedAppointments = await getCompletedAppointments();
    res.json(completedAppointments);
  } catch (error) {
    console.error('Error obteniendo facturacion:', error);
    res.status(500).json({ error: 'Error obteniendo facturación' });
  }
});

router.get('/billing/stats', async (req, res) => {
  try {
    const stats = await getBillingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadisticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;
