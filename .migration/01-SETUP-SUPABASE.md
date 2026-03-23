# Tarea 1: Setup Supabase en el Backend

## Objetivo
Instalar el SDK de Supabase y crear el modulo de conexion.

## Pasos

### 1.1 Instalar dependencia

Ejecutar en `/backend`:

```bash
npm install @supabase/supabase-js
```

### 1.2 Crear fichero `backend/config/supabase.js`

Crear el siguiente fichero:

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL_PROJECT;
const supabaseKey = process.env.SUPABASE_ANON_PUBLIC_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Faltan variables de entorno SUPABASE_URL_PROJECT o SUPABASE_ANON_PUBLIC_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

## Ficheros afectados
- `backend/package.json` (nueva dependencia)
- `backend/config/supabase.js` (nuevo fichero)

## Criterios de aceptacion
- [ ] `@supabase/supabase-js` aparece en package.json dependencies
- [ ] `backend/config/supabase.js` exporta una instancia de supabase
- [ ] No hay errores al importar el modulo
