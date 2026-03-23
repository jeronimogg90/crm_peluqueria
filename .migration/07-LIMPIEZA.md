# Tarea 7: Limpieza - Eliminar SQLite y Ficheros Obsoletos

## Objetivo
Eliminar la dependencia de better-sqlite3 y todos los ficheros de SQLite/legacy.

## Pasos

### 7.1 Desinstalar better-sqlite3

Ejecutar en `/backend`:

```bash
npm uninstall better-sqlite3
```

### 7.2 Eliminar ficheros de base de datos SQLite

Eliminar estos ficheros:

```bash
rm backend/database/peluqueria.db
rm backend/data/database.db
rm backend/data/db.js.old
rm backend/data/db.js.memory-backup
```

### 7.3 Reescribir backend/database/database.js

Este fichero ya no inicializa SQLite. Reemplazar su contenido con un simple
re-export del cliente Supabase (para no romper imports si algo lo referencia):

```javascript
// Este modulo era la inicializacion de SQLite.
// Ahora la BD es Supabase. Ver config/supabase.js
import supabase from '../config/supabase.js';

export default supabase;
export const getDb = () => { throw new Error('SQLite eliminado. Usar Supabase.'); };
```

### 7.4 Eliminar script de migracion obsoleto

```bash
rm backend/add-payment-columns.js
```

### 7.5 Limpiar .env (opcional)

Considerar eliminar variables ya no necesarias:
- `SUPABASE_PASSWORD_DB` (no se usa en el codigo, era para conexion directa)
- `SUPABASE_ACCESS_TOKEN` (management API, no necesario para la app)
- `SUPABASE_PUBLIC_KEY` (la vieja, reemplazada por SUPABASE_ANON_PUBLIC_KEY)

## Criterios de aceptacion
- [ ] better-sqlite3 no aparece en package.json
- [ ] No existen ficheros .db en el proyecto
- [ ] No existen ficheros .old o .memory-backup
- [ ] add-payment-columns.js eliminado
- [ ] database/database.js actualizado (no inicializa SQLite)
- [ ] El proyecto arranca sin errores tras la limpieza
