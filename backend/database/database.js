// Este modulo era la inicializacion de SQLite.
// Ahora la BD es Supabase. Ver config/supabase.js
import supabase from '../config/supabase.js';

export default supabase;
export const getDb = () => { throw new Error('SQLite eliminado. Usar Supabase.'); };
