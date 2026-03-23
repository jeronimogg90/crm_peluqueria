# Tarea 8: Testing y Verificacion

## Objetivo
Verificar que toda la migracion funciona correctamente.

## Pre-requisitos
- Tareas 01 a 07 completadas
- Supabase con tablas creadas y seed data

## Verificacion del Backend

### 8.1 Arrancar el servidor

```bash
cd backend
npm run dev
```

Esperar a ver: "Servidor corriendo en http://localhost:3000"
No debe haber errores de import ni de conexion.

### 8.2 Probar endpoints con curl

```bash
# Health check
curl http://localhost:3000/api/health

# Servicios
curl http://localhost:3000/api/services
curl http://localhost:3000/api/services/all

# Slots
curl http://localhost:3000/api/slots

# Citas
curl http://localhost:3000/api/appointments

# Billing
curl http://localhost:3000/api/billing
curl http://localhost:3000/api/billing/stats

# Clientes
curl http://localhost:3000/api/clients
```

### 8.3 Probar operaciones de escritura

```bash
# Crear servicio
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Service","category":"Peluquería","price":10,"duration":30}'

# Crear cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellidos":"Cliente","telefono":"666000000"}'

# Crear cita (usar un slot disponible)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"slotId":"2025-12-22-09:00","date":"2025-12-22","time":"09:00","clientName":"Test","serviceId":1}'
```

### 8.4 Verificacion del Frontend

1. Arrancar frontend: `cd frontend && npm run dev`
2. Abrir http://localhost:5173
3. Verificar pagina publica (servicios, galeria)
4. Ir a `/admin` -> verificar que el dashboard carga citas
5. Ir a `/admin/servicios` -> verificar CRUD de servicios
6. Ir a `/admin/clientes` -> verificar lista, crear, editar
7. Ir a `/admin/facturacion` -> verificar stats y listado

### 8.5 Verificar en Supabase Dashboard

1. Ir a Table Editor en Supabase
2. Confirmar que los datos creados desde la app aparecen en las tablas
3. Verificar que los servicios creados via API estan en la tabla services
4. Verificar que las citas aparecen en appointments

## Criterios de aceptacion
- [ ] El servidor arranca sin errores
- [ ] Todos los GET endpoints devuelven datos del seed
- [ ] Se pueden crear servicios, clientes y citas
- [ ] El frontend carga correctamente todas las paginas
- [ ] Los datos se persisten en Supabase (visible en Dashboard)
- [ ] No hay referencias a SQLite en ningun fichero del proyecto

## Rollback

Si algo falla, se puede revertir:
1. Reinstalar better-sqlite3: `npm install better-sqlite3`
2. Restaurar db.js desde git: `git checkout -- data/db.js`
3. Restaurar database.js desde git: `git checkout -- database/database.js`
4. Restaurar server.js desde git: `git checkout -- server.js`
5. Restaurar rutas desde git: `git checkout -- routes/`
