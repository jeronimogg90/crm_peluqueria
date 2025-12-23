import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database', 'peluqueria.db'));

console.log('🔄 Agregando columnas de método de pago...');

try {
  // Verificar si las columnas ya existen
  const columns = db.prepare(`PRAGMA table_info(appointments)`).all();
  const hasPaymentMethod = columns.some(col => col.name === 'payment_method');
  
  if (!hasPaymentMethod) {
    db.exec(`ALTER TABLE appointments ADD COLUMN payment_method TEXT`);
    db.exec(`ALTER TABLE appointments ADD COLUMN cash_received REAL`);
    db.exec(`ALTER TABLE appointments ADD COLUMN change_returned REAL`);
    console.log('✅ Columnas agregadas exitosamente');
  } else {
    console.log('ℹ️  Las columnas ya existen');
  }
  
} catch (error) {
  console.error('❌ Error durante la migración:', error);
  process.exit(1);
} finally {
  db.close();
}
