import db from '../database/database.js';

// ========================================
// FUNCIONES PARA SLOTS
// ========================================

export const getAvailableSlots = () => {
  return db.prepare('SELECT * FROM slots WHERE available = 1 ORDER BY date, time').all();
};

export const getSlotById = (slotId) => {
  return db.prepare('SELECT * FROM slots WHERE id = ?').get(slotId);
};

export const bookSlot = (slotId) => {
  const stmt = db.prepare('UPDATE slots SET available = 0 WHERE id = ?');
  stmt.run(slotId);
  return getSlotById(slotId);
};

export const releaseSlot = (slotId) => {
  const stmt = db.prepare('UPDATE slots SET available = 1 WHERE id = ?');
  stmt.run(slotId);
  return getSlotById(slotId);
};

// ========================================
// FUNCIONES PARA SERVICIOS
// ========================================

export const getAllServices = () => {
  return db.prepare('SELECT * FROM services ORDER BY category, name').all();
};

export const getActiveServices = () => {
  return db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY category, name').all();
};

// Alias para compatibilidad
export const getServices = getActiveServices;

export const getServiceById = (id) => {
  return db.prepare('SELECT * FROM services WHERE id = ?').get(id);
};

export const createService = (serviceData) => {
  const { name, category, price, duration, description } = serviceData;
  const stmt = db.prepare(`
    INSERT INTO services (name, category, price, duration, description, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  const result = stmt.run(name, category, price, duration, description || '');
  return getServiceById(result.lastInsertRowid);
};

export const updateService = (id, serviceData) => {
  const { name, category, price, duration, description } = serviceData;
  const stmt = db.prepare(`
    UPDATE services 
    SET name = ?, category = ?, price = ?, duration = ?, description = ?
    WHERE id = ?
  `);
  stmt.run(name, category, price, duration, description || '', id);
  return getServiceById(id);
};

export const deleteService = (id) => {
  const stmt = db.prepare('UPDATE services SET active = 0 WHERE id = ?');
  stmt.run(id);
  return { success: true };
};

// ========================================
// FUNCIONES PARA CITAS
// ========================================

export const getAllAppointments = () => {
  return db.prepare(`
    SELECT * FROM appointments 
    ORDER BY date DESC, time DESC
  `).all();
};

// Alias para compatibilidad
export const getAppointments = getAllAppointments;

export const getAppointmentById = (id) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  
  if (appointment) {
    // Obtener los servicios realizados
    const services = db.prepare(`
      SELECT service_id FROM appointment_services 
      WHERE appointment_id = ?
    `).all(id);
    
    appointment.serviciosRealizados = services.map(s => s.service_id);
  }
  
  return appointment;
};

export const createAppointment = (appointmentData) => {
  const { slotId, date, time, clientName, clientId, service, serviceId, notes } = appointmentData;
  
  const stmt = db.prepare(`
    INSERT INTO appointments (slot_id, date, time, client_name, client_id, service, service_id, notes, status, total_pagado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 0)
  `);
  
  const result = stmt.run(slotId, date, time, clientName, clientId || null, service || '', serviceId, notes || '');
  
  return getAppointmentById(result.lastInsertRowid);
};

export const completeAppointment = (id, serviciosRealizados, paymentData = {}, clientId = null) => {
  // Calcular el total
  let totalPagado = 0;
  if (serviciosRealizados && serviciosRealizados.length > 0) {
    const placeholders = serviciosRealizados.map(() => '?').join(',');
    const services = db.prepare(`
      SELECT SUM(price) as total FROM services 
      WHERE id IN (${placeholders})
    `).get(...serviciosRealizados);
    
    totalPagado = services.total || 0;
  }
  
  // Verificar si existen las columnas de pago
  const columns = db.prepare(`PRAGMA table_info(appointments)`).all();
  const hasPaymentColumns = columns.some(col => col.name === 'payment_method');
  
  // Actualizar la cita con o sin datos de pago según disponibilidad de columnas
  let updateStmt, params;
  if (hasPaymentColumns) {
    updateStmt = db.prepare(`
      UPDATE appointments 
      SET status = 'completed', 
          total_pagado = ?,
          completed_at = ?,
          payment_method = ?,
          cash_received = ?,
          change_returned = ?,
          client_id = COALESCE(?, client_id)
      WHERE id = ?
    `);
    params = [
      totalPagado, 
      new Date().toISOString(), 
      paymentData.paymentMethod || null,
      paymentData.cashReceived || null,
      paymentData.change || null,
      clientId,
      id
    ];
  } else {
    updateStmt = db.prepare(`
      UPDATE appointments 
      SET status = 'completed', 
          total_pagado = ?,
          completed_at = ?,
          client_id = COALESCE(?, client_id)
      WHERE id = ?
    `);
    params = [totalPagado, new Date().toISOString(), clientId, id];
  }
  
  updateStmt.run(...params);
  
  // Insertar los servicios realizados
  if (serviciosRealizados && serviciosRealizados.length > 0) {
    const insertServiceStmt = db.prepare(`
      INSERT INTO appointment_services (appointment_id, service_id)
      VALUES (?, ?)
    `);
    
    const insertMany = db.transaction((items) => {
      for (const serviceId of items) {
        insertServiceStmt.run(id, serviceId);
      }
    });
    
    insertMany(serviciosRealizados);
  }
  
  return getAppointmentById(id);
};

export const updateAppointmentStatus = (id, status) => {
  const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
  stmt.run(status, id);
  return getAppointmentById(id);
};

export const deleteAppointment = (id) => {
  const appointment = getAppointmentById(id);
  
  if (appointment) {
    // Liberar el slot
    releaseSlot(appointment.slot_id);
    
    // Eliminar la cita (cascade eliminará los servicios relacionados)
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  }
  
  return { success: true };
};

// ========================================
// FUNCIONES PARA FACTURACIÓN
// ========================================

export const getCompletedAppointments = () => {
  return db.prepare(`
    SELECT * FROM appointments 
    WHERE status = 'completed'
    ORDER BY completed_at DESC
  `).all().map(apt => {
    // Obtener servicios realizados
    const services = db.prepare(`
      SELECT service_id FROM appointment_services 
      WHERE appointment_id = ?
    `).all(apt.id);
    
    apt.serviciosRealizados = services.map(s => s.service_id);
    return apt;
  });
};

export const getBillingStats = () => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as totalCitas,
      COALESCE(SUM(total_pagado), 0) as totalFacturado,
      COALESCE(AVG(total_pagado), 0) as promedioPorCita
    FROM appointments 
    WHERE status = 'completed'
  `).get();
  
  return stats;
};

// ==================== FUNCIONES DE CLIENTES ====================

export const getAllClients = () => {
  const clients = db.prepare(`
    SELECT 
      c.*,
      COUNT(DISTINCT a.id) as total_citas,
      COALESCE(SUM(a.total_pagado), 0) as total_gastado
    FROM clients c
    LEFT JOIN appointments a ON c.id = a.client_id
    GROUP BY c.id
    ORDER BY c.nombre, c.apellidos
  `).all();
  
  return clients.map(client => ({
    id: client.id,
    nombre: client.nombre,
    apellidos: client.apellidos,
    telefono: client.telefono,
    email: client.email,
    createdAt: client.created_at,
    totalCitas: client.total_citas,
    totalGastado: client.total_gastado
  }));
};

export const getClientById = (id) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
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

export const getClientHistory = (clientId) => {
  const appointments = db.prepare(`
    SELECT 
      a.*,
      GROUP_CONCAT(s.name, ', ') as servicios
    FROM appointments a
    LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
    LEFT JOIN services s ON aps.service_id = s.id
    WHERE a.client_id = ? AND a.status = 'completed'
    GROUP BY a.id
    ORDER BY a.date DESC, a.time DESC
  `).all(clientId);
  
  return appointments.map(apt => ({
    id: apt.id,
    date: apt.date,
    time: apt.time,
    servicios: apt.servicios,
    totalPagado: apt.total_pagado,
    paymentMethod: apt.payment_method,
    completedAt: apt.completed_at,
    notes: apt.notes
  }));
};

export const createClient = (clientData) => {
  const { nombre, apellidos, telefono, email } = clientData;
  
  const stmt = db.prepare(`
    INSERT INTO clients (nombre, apellidos, telefono, email)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(nombre, apellidos, telefono || null, email || null);
  return getClientById(result.lastInsertRowid);
};

export const updateClient = (id, clientData) => {
  const { nombre, apellidos, telefono, email } = clientData;
  
  const stmt = db.prepare(`
    UPDATE clients
    SET nombre = ?, apellidos = ?, telefono = ?, email = ?
    WHERE id = ?
  `);
  
  stmt.run(nombre, apellidos, telefono || null, email || null, id);
  return getClientById(id);
};

// ========================================
// FUNCIONES PARA GOOGLE CALENDAR SYNC
// ========================================

export const getGoogleSyncConfig = () => {
  return db.prepare('SELECT * FROM google_sync_config WHERE id = 1').get();
};

export const saveGoogleSyncConfig = (config) => {
  // Soportar ambos formatos: camelCase y snake_case
  const lastSyncToken = config.lastSyncToken || config.last_sync_token;
  const lastSyncDate = config.lastSyncDate || config.last_sync_date;
  const accessToken = config.accessToken || config.access_token;
  const refreshToken = config.refreshToken || config.refresh_token;
  const tokenExpiry = config.tokenExpiry || config.token_expiry;
  
  const existing = getGoogleSyncConfig();
  
  if (existing) {
    const stmt = db.prepare(`
      UPDATE google_sync_config
      SET last_sync_token = COALESCE(?, last_sync_token), 
          last_sync_date = COALESCE(?, last_sync_date), 
          access_token = COALESCE(?, access_token), 
          refresh_token = COALESCE(?, refresh_token), 
          token_expiry = COALESCE(?, token_expiry)
      WHERE id = 1
    `);
    stmt.run(lastSyncToken, lastSyncDate, accessToken, refreshToken, tokenExpiry);
  } else {
    const stmt = db.prepare(`
      INSERT INTO google_sync_config (id, last_sync_token, last_sync_date, access_token, refresh_token, token_expiry)
      VALUES (1, ?, ?, ?, ?, ?)
    `);
    stmt.run(lastSyncToken || null, lastSyncDate || null, accessToken || null, refreshToken || null, tokenExpiry || null);
  }
  
  return getGoogleSyncConfig();
};

export const saveGoogleEvent = (eventData) => {
  const { googleEventId, summary, description, startTime, endTime, date, location, attendees, calendarType, isWorkEvent } = eventData;
  
  // Intentar insertar o actualizar si ya existe
  const stmt = db.prepare(`
    INSERT INTO google_events (google_event_id, summary, description, start_time, end_time, date, location, attendees, calendar_type, is_work_event)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(google_event_id) 
    DO UPDATE SET 
      summary = excluded.summary,
      description = excluded.description,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      date = excluded.date,
      location = excluded.location,
      attendees = excluded.attendees,
      calendar_type = excluded.calendar_type,
      is_work_event = excluded.is_work_event
  `);
  
  stmt.run(googleEventId, summary || null, description || null, startTime, endTime, date, location || null, attendees || null, calendarType || 'casa', isWorkEvent ? 1 : 0);
};

export const getUnconvertedWorkEvents = () => {
  return db.prepare(`
    SELECT * FROM google_events 
    WHERE is_work_event = 1 AND converted = 0
    ORDER BY date, start_time
  `).all();
};

export const getAllGoogleEvents = () => {
  return db.prepare('SELECT * FROM google_events ORDER BY date, start_time').all();
};

export const getGoogleEventById = (id) => {
  return db.prepare('SELECT * FROM google_events WHERE id = ?').get(id);
};

export const markEventAsConverted = (googleEventId, appointmentId) => {
  const stmt = db.prepare(`
    UPDATE google_events
    SET converted = 1, converted_appointment_id = ?
    WHERE id = ?
  `);
  stmt.run(appointmentId, googleEventId);
};

export const deleteGoogleEvent = (id) => {
  const stmt = db.prepare('DELETE FROM google_events WHERE id = ?');
  stmt.run(id);
  return { success: true };
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

export const getDatabase = () => db;
