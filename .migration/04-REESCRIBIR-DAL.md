# Tarea 4: Reescribir Data Access Layer (db.js)

## Objetivo
Reescribir completamente `backend/data/db.js` para usar `@supabase/supabase-js`
en lugar de `better-sqlite3`. Todas las funciones pasan a ser async.

## Fichero a reescribir
`backend/data/db.js` (431 lineas actuales -> reescritura completa)

## Contexto importante
- Leer `00-CONTEXTO.md` para el esquema completo de tablas
- El fichero actual importa `db` desde `../database/database.js` (SQLite)
- El nuevo fichero debe importar `supabase` desde `../config/supabase.js`
- TODAS las funciones pasan a ser `async` y devuelven Promises
- Los exports se mantienen con los mismos nombres para no romper imports
- En SQLite los booleanos son 0/1, en Supabase/PostgreSQL son true/false
- `lastInsertRowid` no existe en Supabase; usar `.select()` en insert para obtener el registro
- `better-sqlite3` transactions -> queries secuenciales en Supabase
- `PRAGMA table_info` no existe en PostgreSQL (eliminar ese check en completeAppointment)
- `GROUP_CONCAT` de SQLite -> no necesario, obtener servicios en query separada

## Codigo completo del nuevo `backend/data/db.js`

```javascript
import supabase from '../config/supabase.js';

// ========================================
// FUNCIONES PARA SLOTS
// ========================================

export const getAvailableSlots = async () => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('available', true)
    .order('date')
    .order('time');
  if (error) throw error;
  return data;
};

export const getSlotById = async (slotId) => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slotId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const bookSlot = async (slotId) => {
  const { error } = await supabase
    .from('slots')
    .update({ available: false })
    .eq('id', slotId);
  if (error) throw error;
  return getSlotById(slotId);
};

export const releaseSlot = async (slotId) => {
  const { error } = await supabase
    .from('slots')
    .update({ available: true })
    .eq('id', slotId);
  if (error) throw error;
  return getSlotById(slotId);
};

// ========================================
// FUNCIONES PARA SERVICIOS
// ========================================

export const getAllServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('category')
    .order('name');
  if (error) throw error;
  return data;
};

export const getActiveServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('name');
  if (error) throw error;
  return data;
};

export const getServices = getActiveServices;

export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createService = async (serviceData) => {
  const { name, category, price, duration, description } = serviceData;
  const { data, error } = await supabase
    .from('services')
    .insert({ name, category, price, duration, description: description || '', active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateService = async (id, serviceData) => {
  const { name, category, price, duration, description } = serviceData;
  const { data, error } = await supabase
    .from('services')
    .update({ name, category, price, duration, description: description || '' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteService = async (id) => {
  const { error } = await supabase
    .from('services')
    .update({ active: false })
    .eq('id', id);
  if (error) throw error;
  return { success: true };
};

// ========================================
// FUNCIONES PARA CITAS
// ========================================

export const getAllAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAppointments = getAllAppointments;

export const getAppointmentById = async (id) => {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!appointment) return null;

  // Obtener servicios realizados
  const { data: services, error: svcError } = await supabase
    .from('appointment_services')
    .select('service_id')
    .eq('appointment_id', id);
  if (svcError) throw svcError;

  appointment.serviciosRealizados = services.map(s => s.service_id);
  return appointment;
};

export const createAppointment = async (appointmentData) => {
  const { slotId, date, time, clientName, clientId, service, serviceId, notes } = appointmentData;

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      slot_id: slotId,
      date,
      time,
      client_name: clientName,
      client_id: clientId || null,
      service: service || '',
      service_id: serviceId,
      notes: notes || '',
      status: 'confirmed',
      total_pagado: 0
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const completeAppointment = async (id, serviciosRealizados, paymentData = {}, clientId = null) => {
  // Calcular el total
  let totalPagado = 0;
  if (serviciosRealizados && serviciosRealizados.length > 0) {
    const { data: services, error: svcError } = await supabase
      .from('services')
      .select('price')
      .in('id', serviciosRealizados);
    if (svcError) throw svcError;
    totalPagado = services.reduce((sum, s) => sum + Number(s.price), 0);
  }

  // Actualizar la cita
  const updateData = {
    status: 'completed',
    total_pagado: totalPagado,
    completed_at: new Date().toISOString(),
    payment_method: paymentData.paymentMethod || null,
    cash_received: paymentData.cashReceived || null,
    change_returned: paymentData.change || null
  };

  if (clientId) {
    updateData.client_id = clientId;
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id);
  if (updateError) throw updateError;

  // Insertar servicios realizados
  if (serviciosRealizados && serviciosRealizados.length > 0) {
    const rows = serviciosRealizados.map(serviceId => ({
      appointment_id: Number(id),
      service_id: serviceId
    }));
    const { error: insertError } = await supabase
      .from('appointment_services')
      .insert(rows);
    if (insertError) throw insertError;
  }

  return getAppointmentById(id);
};

export const updateAppointmentStatus = async (id, status) => {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  return getAppointmentById(id);
};

export const deleteAppointment = async (id) => {
  const appointment = await getAppointmentById(id);

  if (appointment) {
    await releaseSlot(appointment.slot_id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  return { success: true };
};

// ========================================
// FUNCIONES PARA FACTURACION
// ========================================

export const getCompletedAppointments = async () => {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });
  if (error) throw error;

  // Obtener servicios realizados para cada cita
  for (const apt of appointments) {
    const { data: services, error: svcError } = await supabase
      .from('appointment_services')
      .select('service_id')
      .eq('appointment_id', apt.id);
    if (svcError) throw svcError;
    apt.serviciosRealizados = services.map(s => s.service_id);
  }

  return appointments;
};

export const getBillingStats = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('total_pagado')
    .eq('status', 'completed');
  if (error) throw error;

  const totalCitas = data.length;
  const totalFacturado = data.reduce((sum, a) => sum + Number(a.total_pagado || 0), 0);
  const promedioPorCita = totalCitas > 0 ? totalFacturado / totalCitas : 0;

  return {
    totalCitas,
    totalFacturado,
    promedioPorCita
  };
};

// ========================================
// FUNCIONES DE CLIENTES
// ========================================

export const getAllClients = async () => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('nombre')
    .order('apellidos');
  if (error) throw error;

  // Para cada cliente, obtener stats de citas
  const result = [];
  for (const client of clients) {
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, total_pagado')
      .eq('client_id', client.id);
    if (aptError) throw aptError;

    result.push({
      id: client.id,
      nombre: client.nombre,
      apellidos: client.apellidos,
      telefono: client.telefono,
      email: client.email,
      createdAt: client.created_at,
      totalCitas: appointments.length,
      totalGastado: appointments.reduce((sum, a) => sum + Number(a.total_pagado || 0), 0)
    });
  }

  return result;
};

export const getClientById = async (id) => {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!client) return null;

  return {
    id: client.id,
    nombre: client.nombre,
    apellidos: client.apellidos,
    telefono: client.telefono,
    email: client.email,
    createdAt: client.created_at
  };
};

export const getClientHistory = async (clientId) => {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .order('time', { ascending: false });
  if (error) throw error;

  const result = [];
  for (const apt of appointments) {
    const { data: aptServices, error: svcError } = await supabase
      .from('appointment_services')
      .select('service_id')
      .eq('appointment_id', apt.id);
    if (svcError) throw svcError;

    let servicios = null;
    if (aptServices.length > 0) {
      const serviceIds = aptServices.map(s => s.service_id);
      const { data: serviceNames, error: nameError } = await supabase
        .from('services')
        .select('name')
        .in('id', serviceIds);
      if (nameError) throw nameError;
      servicios = serviceNames.map(s => s.name).join(', ');
    }

    result.push({
      id: apt.id,
      date: apt.date,
      time: apt.time,
      servicios,
      totalPagado: apt.total_pagado,
      paymentMethod: apt.payment_method,
      completedAt: apt.completed_at,
      notes: apt.notes
    });
  }

  return result;
};

export const createClient = async (clientData) => {
  const { nombre, apellidos, telefono, email } = clientData;
  const { data, error } = await supabase
    .from('clients')
    .insert({ nombre, apellidos, telefono: telefono || null, email: email || null })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    nombre: data.nombre,
    apellidos: data.apellidos,
    telefono: data.telefono,
    email: data.email,
    createdAt: data.created_at
  };
};

export const updateClient = async (id, clientData) => {
  const { nombre, apellidos, telefono, email } = clientData;
  const { data, error } = await supabase
    .from('clients')
    .update({ nombre, apellidos, telefono: telefono || null, email: email || null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    nombre: data.nombre,
    apellidos: data.apellidos,
    telefono: data.telefono,
    email: data.email,
    createdAt: data.created_at
  };
};

// ========================================
// FUNCIONES PARA GOOGLE CALENDAR SYNC
// ========================================

export const getGoogleSyncConfig = async () => {
  const { data, error } = await supabase
    .from('google_sync_config')
    .select('*')
    .eq('id', 1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const saveGoogleSyncConfig = async (config) => {
  const lastSyncToken = config.lastSyncToken || config.last_sync_token;
  const lastSyncDate = config.lastSyncDate || config.last_sync_date;
  const accessToken = config.accessToken || config.access_token;
  const refreshToken = config.refreshToken || config.refresh_token;
  const tokenExpiry = config.tokenExpiry || config.token_expiry;

  const existing = await getGoogleSyncConfig();

  if (existing) {
    const updateData = {};
    if (lastSyncToken !== undefined) updateData.last_sync_token = lastSyncToken;
    if (lastSyncDate !== undefined) updateData.last_sync_date = lastSyncDate;
    if (accessToken !== undefined) updateData.access_token = accessToken;
    if (refreshToken !== undefined) updateData.refresh_token = refreshToken;
    if (tokenExpiry !== undefined) updateData.token_expiry = tokenExpiry;

    const { error } = await supabase
      .from('google_sync_config')
      .update(updateData)
      .eq('id', 1);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('google_sync_config')
      .insert({
        id: 1,
        last_sync_token: lastSyncToken || null,
        last_sync_date: lastSyncDate || null,
        access_token: accessToken || null,
        refresh_token: refreshToken || null,
        token_expiry: tokenExpiry || null
      });
    if (error) throw error;
  }

  return getGoogleSyncConfig();
};

export const saveGoogleEvent = async (eventData) => {
  const { googleEventId, summary, description, startTime, endTime, date, location, attendees, calendarType, isWorkEvent } = eventData;

  const { error } = await supabase
    .from('google_events')
    .upsert({
      google_event_id: googleEventId,
      summary: summary || null,
      description: description || null,
      start_time: startTime,
      end_time: endTime,
      date,
      location: location || null,
      attendees: attendees || null,
      calendar_type: calendarType || 'casa',
      is_work_event: isWorkEvent ? true : false
    }, { onConflict: 'google_event_id' });
  if (error) throw error;
};

export const getUnconvertedWorkEvents = async () => {
  const { data, error } = await supabase
    .from('google_events')
    .select('*')
    .eq('is_work_event', true)
    .eq('converted', false)
    .order('date')
    .order('start_time');
  if (error) throw error;
  return data;
};

export const getAllGoogleEvents = async () => {
  const { data, error } = await supabase
    .from('google_events')
    .select('*')
    .order('date')
    .order('start_time');
  if (error) throw error;
  return data;
};

export const getGoogleEventById = async (id) => {
  const { data, error } = await supabase
    .from('google_events')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const markEventAsConverted = async (googleEventId, appointmentId) => {
  const { error } = await supabase
    .from('google_events')
    .update({ converted: true, converted_appointment_id: appointmentId })
    .eq('id', googleEventId);
  if (error) throw error;
};

export const deleteGoogleEvent = async (id) => {
  const { error } = await supabase
    .from('google_events')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
};
```

## Notas importantes

1. **Error code PGRST116**: Supabase devuelve este codigo cuando `.single()` no
   encuentra filas. Lo ignoramos porque equivale a "no encontrado" (return null).

2. **getBillingStats**: En SQLite usaba SUM/AVG/COUNT en SQL. En Supabase, como
   el cliente JS no soporta funciones de agregacion directas facilmente, obtenemos
   los datos y calculamos en JS. Para pocos registros esto es aceptable.

3. **getAllClients con stats**: Mismo caso, hacemos un loop con queries individuales.
   Si en el futuro el volumen crece, esto se puede optimizar con una vista SQL o RPC.

4. **completeAppointment**: Se elimino el check de PRAGMA table_info ya que en
   Supabase las columnas de pago siempre existen (se crearon en el esquema).

5. **saveGoogleEvent**: Usa `.upsert()` con `onConflict: 'google_event_id'`
   que es equivalente al `INSERT ON CONFLICT` de SQLite.

6. **getDatabase/getDb**: Estas funciones se ELIMINAN. Ya no se exportan.

## Criterios de aceptacion
- [ ] Fichero reescrito completamente con imports de supabase
- [ ] Todas las funciones son async
- [ ] Los mismos nombres de export se mantienen
- [ ] No hay referencias a better-sqlite3 ni al modulo database.js
- [ ] getDatabase/getDb ya no se exportan
