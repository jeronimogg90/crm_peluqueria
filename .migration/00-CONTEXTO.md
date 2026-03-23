# Contexto de la Migracion: SQLite -> Supabase

## Resumen del Proyecto

CRM para peluqueria (salon de belleza). Full-stack monorepo con:
- **Backend:** Express.js (Node 20, ES Modules) en `/backend`
- **Frontend:** React + Vite en `/frontend`
- **Base de datos actual:** SQLite via `better-sqlite3` (sincrono, fichero local)
- **Base de datos objetivo:** Supabase (PostgreSQL hosted) via `@supabase/supabase-js`

## Variables de Entorno Disponibles (backend/.env)

Las que se usaran en el codigo son:
- `SUPABASE_URL_PROJECT` - URL del proyecto Supabase
- `SUPABASE_ANON_PUBLIC_KEY` - Anon key (JWT) para el cliente JS

## Arquitectura Actual

```
backend/
  server.js              <- Entry point Express, monta rutas en /api
  database/
    database.js          <- Inicializacion SQLite (CREATE TABLE, seed)
    peluqueria.db        <- Fichero SQLite activo (127KB, datos de prueba)
  data/
    db.js                <- Data Access Layer (~30 funciones exportadas, SQL raw sincrono)
    db.js.old            <- Backup viejo (ignorar)
    db.js.memory-backup  <- Backup viejo (ignorar)
    database.db          <- Fichero vacio legacy (ignorar)
  routes/
    appointments.js      <- Rutas: slots, citas, billing
    services.js          <- Rutas: CRUD servicios
    clients.js           <- Rutas: CRUD clientes
    googleCalendar.js    <- Rutas: sync Google Calendar
  services/
    googleCalendar.js    <- Logica OAuth2 + sync con Google Calendar (usa db.js)
  config/
    email.js             <- Nodemailer config (no usado activamente)
```

## Esquema de Base de Datos (7 tablas)

### services
| Columna     | SQLite          | PostgreSQL (Supabase)        |
|-------------|-----------------|------------------------------|
| id          | INTEGER PK AUTO | SERIAL PRIMARY KEY           |
| name        | TEXT NOT NULL    | TEXT NOT NULL                 |
| category    | TEXT NOT NULL    | TEXT NOT NULL                 |
| price       | REAL NOT NULL   | NUMERIC(10,2) NOT NULL       |
| duration    | INTEGER NOT NULL| INTEGER NOT NULL              |
| description | TEXT            | TEXT                          |
| active      | INTEGER (0/1)   | BOOLEAN DEFAULT true          |
| created_at  | TEXT            | TIMESTAMPTZ DEFAULT now()     |

### slots
| Columna   | SQLite        | PostgreSQL                     |
|-----------|---------------|--------------------------------|
| id        | TEXT PK       | TEXT PRIMARY KEY                |
| date      | TEXT NOT NULL | TEXT NOT NULL                   |
| time      | TEXT NOT NULL | TEXT NOT NULL                   |
| available | INTEGER (0/1) | BOOLEAN DEFAULT true            |

### appointments
| Columna         | SQLite          | PostgreSQL                          |
|-----------------|-----------------|-------------------------------------|
| id              | INTEGER PK AUTO | SERIAL PRIMARY KEY                  |
| slot_id         | TEXT NOT NULL   | TEXT NOT NULL                        |
| date            | TEXT NOT NULL   | TEXT NOT NULL                        |
| time            | TEXT NOT NULL   | TEXT NOT NULL                        |
| client_name     | TEXT NOT NULL   | TEXT NOT NULL                        |
| service         | TEXT            | TEXT                                |
| service_id      | INTEGER FK      | INTEGER REFERENCES services(id)     |
| notes           | TEXT            | TEXT                                |
| status          | TEXT            | TEXT DEFAULT 'confirmed'            |
| total_pagado    | REAL            | NUMERIC(10,2) DEFAULT 0             |
| created_at      | TEXT            | TIMESTAMPTZ DEFAULT now()           |
| completed_at    | TEXT            | TIMESTAMPTZ                         |
| payment_method  | TEXT            | TEXT                                |
| cash_received   | REAL            | NUMERIC(10,2)                       |
| change_returned | REAL            | NUMERIC(10,2)                       |
| client_id       | INTEGER FK      | INTEGER REFERENCES clients(id)      |

### appointment_services
| Columna        | SQLite          | PostgreSQL                                     |
|----------------|-----------------|------------------------------------------------|
| id             | INTEGER PK AUTO | SERIAL PRIMARY KEY                             |
| appointment_id | INTEGER FK      | INTEGER REFS appointments(id) ON DELETE CASCADE|
| service_id     | INTEGER FK      | INTEGER REFERENCES services(id)                |

### clients
| Columna    | SQLite          | PostgreSQL                    |
|------------|-----------------|-------------------------------|
| id         | INTEGER PK AUTO | SERIAL PRIMARY KEY            |
| nombre     | TEXT NOT NULL   | TEXT NOT NULL                  |
| apellidos  | TEXT NOT NULL   | TEXT NOT NULL                  |
| telefono   | TEXT            | TEXT                          |
| email      | TEXT            | TEXT                          |
| created_at | TEXT            | TIMESTAMPTZ DEFAULT now()     |

### google_sync_config
| Columna         | SQLite              | PostgreSQL                   |
|-----------------|---------------------|------------------------------|
| id              | INTEGER PK CHECK(1) | INTEGER PK CHECK(id=1)       |
| last_sync_token | TEXT                | TEXT                         |
| last_sync_date  | TEXT                | TEXT                         |
| access_token    | TEXT                | TEXT                         |
| refresh_token   | TEXT                | TEXT                         |
| token_expiry    | TEXT                | TEXT                         |

### google_events
| Columna                  | SQLite          | PostgreSQL                            |
|--------------------------|-----------------|---------------------------------------|
| id                       | INTEGER PK AUTO | SERIAL PRIMARY KEY                    |
| google_event_id          | TEXT UNIQUE     | TEXT UNIQUE NOT NULL                  |
| summary                  | TEXT            | TEXT                                  |
| description              | TEXT            | TEXT                                  |
| start_time               | TEXT NOT NULL   | TEXT NOT NULL                         |
| end_time                 | TEXT NOT NULL   | TEXT NOT NULL                         |
| date                     | TEXT NOT NULL   | TEXT NOT NULL                         |
| location                 | TEXT            | TEXT                                  |
| attendees                | TEXT            | TEXT                                  |
| calendar_type            | TEXT            | TEXT DEFAULT 'casa'                   |
| is_work_event            | INTEGER (0/1)   | BOOLEAN DEFAULT false                 |
| converted                | INTEGER (0/1)   | BOOLEAN DEFAULT false                 |
| converted_appointment_id | INTEGER         | INTEGER REFERENCES appointments(id)   |
| created_at               | TEXT            | TIMESTAMPTZ DEFAULT now()             |

## Cambio Clave: Sincrono -> Asincrono

`better-sqlite3` es sincrono: `db.prepare('...').all()` devuelve resultado directo.
`@supabase/supabase-js` es asincrono: `supabase.from('x').select()` devuelve Promise.

Impacto:
1. Todas las funciones del DAL (`db.js`) pasan a ser `async`
2. Todos los route handlers necesitan `async` + `await`
3. El servicio `services/googleCalendar.js` tambien llama a funciones del DAL y necesita `await`

## Nota sobre RLS (Row Level Security)

Supabase tiene RLS activado por defecto en tablas nuevas. Como este proyecto
NO tiene autenticacion, se debe desactivar RLS en todas las tablas.

## Frontend

El frontend NO necesita cambios. Solo consume endpoints REST del backend.
