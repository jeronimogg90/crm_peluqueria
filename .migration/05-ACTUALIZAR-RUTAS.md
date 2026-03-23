# Tarea 5: Actualizar Rutas a Async/Await

## Objetivo
Hacer que todos los route handlers usen async/await al llamar a funciones del DAL.

## Contexto
Tras la tarea 04, todas las funciones de `db.js` son async. Los route handlers
que las llaman necesitan `async` en la firma y `await` en cada llamada.

## Ficheros a modificar

### 5.1 backend/routes/appointments.js

Cambios necesarios:
- GET /slots: anadir `async` al handler, `await getAvailableSlots()`
- POST /appointments: ya es async, solo anadir `await createAppointment(...)`
- GET /appointments: anadir `async`, `await getAppointments()`
- PATCH /appointments/:id/complete: ya es async, anadir `await completeAppointment(...)`
- GET /billing: anadir `async`, `await getCompletedAppointments()`
- GET /billing/stats: anadir `async`, `await getBillingStats()`

Codigo completo del fichero:

```javascript
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
```

### 5.2 backend/routes/services.js

Cambios: todos los handlers pasan a `async` con `await`.

Codigo completo:

```javascript
import express from 'express';
import {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../data/db.js';

const router = express.Router();

router.get('/services', async (req, res) => {
  try {
    const activeServices = await getServices();
    res.json(activeServices);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/services/all', async (req, res) => {
  try {
    const allServices = await getAllServices();
    res.json(allServices);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ error: 'Error obteniendo servicio' });
  }
});

router.post('/services', async (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    if (!name || !category || !price || !duration) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const newService = await createService({
      name,
      category,
      price: parseFloat(price),
      duration: parseInt(duration),
      description: description || ''
    });
    res.status(201).json({ message: 'Servicio creado exitosamente', service: newService });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error creando servicio' });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const { name, category, price, duration, description, active } = req.body;
    const updatedService = await updateService(req.params.id, {
      name, category,
      price: price ? parseFloat(price) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      description, active
    });
    if (!updatedService) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio actualizado exitosamente', service: updatedService });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error actualizando servicio' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const deleted = await deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error eliminando servicio' });
  }
});

export default router;
```

### 5.3 backend/routes/clients.js

Cambios: todos los handlers pasan a `async` con `await`.

Codigo completo:

```javascript
import express from 'express';
import {
  getAllClients,
  getClientById,
  getClientHistory,
  createClient,
  updateClient
} from '../data/db.js';

const router = express.Router();

router.get('/clients', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error obteniendo cliente' });
  }
});

router.get('/clients/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await getClientHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial del cliente' });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { nombre, apellidos, telefono, email } = req.body;
    if (!nombre || !apellidos) {
      return res.status(400).json({ error: 'Nombre y apellidos son requeridos' });
    }
    const client = await createClient({ nombre, apellidos, telefono, email });
    res.status(201).json({ message: 'Cliente creado exitosamente', client });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, telefono, email } = req.body;
    if (!nombre || !apellidos) {
      return res.status(400).json({ error: 'Nombre y apellidos son requeridos' });
    }
    const client = await updateClient(id, { nombre, apellidos, telefono, email });
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado exitosamente', client });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
});

export default router;
```

### 5.4 backend/routes/googleCalendar.js

Cambios: los handlers que llaman a funciones del DAL necesitan `await`.
Las funciones saveGoogleEvent, getUnconvertedWorkEvents, getAllGoogleEvents,
markEventAsConverted, deleteGoogleEvent ahora son async.

Codigo completo:

```javascript
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
```

### 5.5 backend/services/googleCalendar.js

Este fichero tambien usa funciones del DAL (getGoogleSyncConfig, saveGoogleSyncConfig).
Como ahora son async, hay que anadir `await`.

Cambios puntuales (NO reescritura completa, solo modificar estas funciones):

**createOAuth2Client** - hacer `async`, anadir `await`:
```javascript
export const createOAuth2Client = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback'
  );

  const config = await getGoogleSyncConfig();
  if (config && config.access_token) {
    oauth2Client.setCredentials({
      access_token: config.access_token,
      refresh_token: config.refresh_token,
      expiry_date: config.token_expiry ? new Date(config.token_expiry).getTime() : null
    });
  }

  return oauth2Client;
};
```

**getAuthUrl** - hacer `async`, anadir `await`:
```javascript
export const getAuthUrl = async () => {
  const oauth2Client = await createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};
```

**getTokensFromCode** - anadir `await` a createOAuth2Client y saveGoogleSyncConfig:
```javascript
export const getTokensFromCode = async (code) => {
  const oauth2Client = await createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  await saveGoogleSyncConfig({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    lastSyncDate: new Date().toISOString()
  });

  return tokens;
};
```

**syncCalendarEvents** - anadir `await` a createOAuth2Client, getGoogleSyncConfig, saveGoogleSyncConfig:
```javascript
export const syncCalendarEvents = async () => {
  const oauth2Client = await createOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const config = await getGoogleSyncConfig();

  // ... resto del codigo igual ...

  // Al final, antes del return:
  await saveGoogleSyncConfig({
    ...config,
    lastSyncDate: new Date().toISOString()
  });

  return allEvents;
};
```

Las funciones `detectCalendarType`, `isWorkEvent` y `formatGoogleEvent` NO cambian
(no usan la BD).

## Criterios de aceptacion
- [ ] Todos los handlers de las 4 rutas son async
- [ ] Todas las llamadas a funciones del DAL usan await
- [ ] services/googleCalendar.js actualizado con await en createOAuth2Client, getAuthUrl, getTokensFromCode, syncCalendarEvents
- [ ] No hay llamadas sincronas a funciones que ahora son async
- [ ] El servidor arranca sin errores
