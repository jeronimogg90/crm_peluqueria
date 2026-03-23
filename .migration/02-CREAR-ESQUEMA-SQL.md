# Tarea 2: Crear Esquema de Base de Datos en Supabase

## Objetivo
Ejecutar SQL en el SQL Editor de Supabase para crear las 7 tablas.

## Instrucciones
Ir a Supabase Dashboard > SQL Editor > New Query y ejecutar el siguiente SQL completo.

## SQL a ejecutar

```sql
-- =============================================
-- ESQUEMA CRM PELUQUERIA - Migracion a Supabase
-- =============================================

-- 1. SERVICIOS
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- 2. SLOTS DE TIEMPO
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  available BOOLEAN DEFAULT true
);

ALTER TABLE slots DISABLE ROW LEVEL SECURITY;

-- 3. CLIENTES (antes que appointments por FK)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 4. CITAS
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  slot_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service TEXT,
  service_id INTEGER REFERENCES services(id),
  notes TEXT,
  status TEXT DEFAULT 'confirmed',
  total_pagado NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  payment_method TEXT,
  cash_received NUMERIC(10,2),
  change_returned NUMERIC(10,2),
  client_id INTEGER REFERENCES clients(id)
);

ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- 5. SERVICIOS REALIZADOS (many-to-many)
CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id)
);

ALTER TABLE appointment_services DISABLE ROW LEVEL SECURITY;

-- 6. CONFIGURACION GOOGLE SYNC (singleton)
CREATE TABLE IF NOT EXISTS google_sync_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_sync_token TEXT,
  last_sync_date TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TEXT
);

ALTER TABLE google_sync_config DISABLE ROW LEVEL SECURITY;

-- 7. EVENTOS GOOGLE CALENDAR
CREATE TABLE IF NOT EXISTS google_events (
  id SERIAL PRIMARY KEY,
  google_event_id TEXT UNIQUE NOT NULL,
  summary TEXT,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  attendees TEXT,
  calendar_type TEXT DEFAULT 'casa',
  is_work_event BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  converted_appointment_id INTEGER REFERENCES appointments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE google_events DISABLE ROW LEVEL SECURITY;
```

## Verificacion
Tras ejecutar, ir a Table Editor en Supabase y confirmar que existen las 7 tablas:
- services, slots, clients, appointments, appointment_services, google_sync_config, google_events

## Criterios de aceptacion
- [ ] Las 7 tablas existen en Supabase
- [ ] RLS esta desactivado en todas las tablas
- [ ] Las foreign keys estan configuradas correctamente
- [ ] appointment_services tiene ON DELETE CASCADE en appointment_id
