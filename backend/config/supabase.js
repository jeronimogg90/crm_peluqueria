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
