import express from 'express';
import {
  getAuthUrl,
  getTokensFromCode,
  syncCalendarEvents,
  formatGoogleEvent
} from '../services/googleCalendar.js';
import {
  saveGoogleEvent,
  getUnconvertedWorkEvents,
  getAllGoogleEvents,
  markEventAsConverted,
  deleteGoogleEvent
} from '../data/db.js';

const router = express.Router();

router.get('/google/auth-url', async (req, res) => {
  try {
    const url = await getAuthUrl();
    res.json({ url });
  } catch (error) {
    console.error('Error generando URL de autenticacion:', error);
    res.status(500).json({ error: 'Error generando URL de autenticación' });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Código de autorización no proporcionado' });
    }
    await getTokensFromCode(code);
    res.redirect('http://localhost:5173/admin?google_auth=success');
  } catch (error) {
    console.error('Error en callback de Google:', error);
    res.redirect('http://localhost:5173/admin?google_auth=error');
  }
});

router.post('/google/sync', async (req, res) => {
  try {
    const events = await syncCalendarEvents();

    let workEventsCount = 0;
    let regularEventsCount = 0;

    for (const event of events) {
      const formattedEvent = formatGoogleEvent(event);
      await saveGoogleEvent(formattedEvent);

      if (formattedEvent.isWorkEvent) {
        workEventsCount++;
      } else {
        regularEventsCount++;
      }
    }

    res.json({
      message: 'Sincronización completada',
      total: events.length,
      workEvents: workEventsCount,
      regularEvents: regularEventsCount
    });
  } catch (error) {
    console.error('Error sincronizando eventos:', error);
    if (error.message && (
      error.message.includes('No access') ||
      error.message.includes('invalid_grant') ||
      error.message.includes('refresh token')
    )) {
      return res.status(401).json({
        error: 'Autenticación requerida. Por favor, autoriza el acceso a Google Calendar.',
        needsAuth: true
      });
    }
    res.status(500).json({ error: 'Error sincronizando eventos', details: error.message });
  }
});

router.get('/google/work-events', async (req, res) => {
  try {
    const events = await getUnconvertedWorkEvents();
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo eventos de trabajo:', error);
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
});

router.get('/google/events', async (req, res) => {
  try {
    const events = await getAllGoogleEvents();
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
});

router.patch('/google/events/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentId } = req.body;
    await markEventAsConverted(id, appointmentId);
    res.json({ message: 'Evento marcado como convertido' });
  } catch (error) {
    console.error('Error marcando evento:', error);
    res.status(500).json({ error: 'Error actualizando evento' });
  }
});

router.delete('/google/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteGoogleEvent(id);
    res.json({ message: 'Evento descartado' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ error: 'Error eliminando evento' });
  }
});

export default router;
