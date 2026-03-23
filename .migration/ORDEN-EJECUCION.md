# Orden de Ejecucion de Tareas

Ejecutar en este orden estricto. Cada tarea depende de las anteriores.

| # | Fichero | Descripcion | Donde |
|---|---------|-------------|-------|
| 1 | 01-SETUP-SUPABASE.md | Instalar SDK + crear config/supabase.js | Terminal + IDE |
| 2 | 02-CREAR-ESQUEMA-SQL.md | Crear 7 tablas en Supabase | Supabase Dashboard |
| 3 | 03-SEED-DATA.md | Insertar datos de ejemplo | Supabase Dashboard |
| 4 | 04-REESCRIBIR-DAL.md | Reescribir data/db.js completo | IDE |
| 5 | 05-ACTUALIZAR-RUTAS.md | Async/await en todas las rutas + googleCalendar service | IDE |
| 6 | 06-ACTUALIZAR-SERVER.md | Limpiar server.js | IDE |
| 7 | 07-LIMPIEZA.md | Eliminar SQLite, ficheros obsoletos | Terminal + IDE |
| 8 | 08-TESTING.md | Verificar todo | Terminal + Browser |

## Notas
- Las tareas 2 y 3 se ejecutan en Supabase Dashboard (SQL Editor), no en el codigo
- Las tareas 4, 5 y 6 son las que modifican codigo del backend
- La tarea 7 es limpieza final
- La tarea 8 es verificacion, no modifica nada
- Si falla la tarea 8, revisar las tareas 4 y 5 (las mas complejas)
- El frontend NO se toca en ninguna tarea
