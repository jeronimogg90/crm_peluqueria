import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear o abrir la base de datos
const db = new Database(path.join(__dirname, 'peluqueria.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear tablas
const initDB = () => {
  // Tabla de servicios
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      duration INTEGER NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de slots de tiempo
  db.exec(`
    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      available INTEGER DEFAULT 1
    )
  `);

  // Tabla de citas
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      client_name TEXT NOT NULL,
      service TEXT,
      service_id INTEGER,
      notes TEXT,
      status TEXT DEFAULT 'confirmed',
      total_pagado REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  // Tabla de servicios realizados (relación muchos a muchos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointment_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  // Tabla de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de configuración de sincronización Google Calendar
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_sync_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_sync_token TEXT,
      last_sync_date TEXT,
      access_token TEXT,
      refresh_token TEXT,
      token_expiry TEXT
    )
  `);

  // Tabla de eventos de Google Calendar (temporales)
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_event_id TEXT UNIQUE NOT NULL,
      summary TEXT,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      attendees TEXT,
      calendar_type TEXT DEFAULT 'casa',
      is_work_event INTEGER DEFAULT 0,
      converted INTEGER DEFAULT 0,
      converted_appointment_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (converted_appointment_id) REFERENCES appointments(id)
    )
  `);

  console.log('✅ Base de datos inicializada correctamente');
};

// Función para insertar datos iniciales
const seedDatabase = () => {
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  
  if (serviceCount.count === 0) {
    console.log('📦 Insertando datos iniciales...');
    
    // Servicios iniciales
    const insertService = db.prepare(`
      INSERT INTO services (name, category, price, duration, description, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const services = [
      ['Corte de Pelo Mujer', 'Peluquería', 25, 45, 'Corte personalizado con lavado y secado incluido', 1],
      ['Corte de Pelo Hombre', 'Peluquería', 15, 30, 'Corte de caballero con acabado profesional', 1],
      ['Tinte Completo', 'Peluquería', 45, 90, 'Coloración completa con productos de calidad', 1],
      ['Mechas', 'Peluquería', 55, 120, 'Mechas personalizadas con técnicas modernas', 1],
      ['Tratamiento Keratina', 'Peluquería', 80, 120, 'Alisado brasileño con keratina', 1],
      ['Peinado Especial', 'Peluquería', 35, 60, 'Peinado para eventos y ocasiones especiales', 1],
      ['Lavado y Secado', 'Peluquería', 15, 30, 'Lavado profesional con secado incluido', 1],
      ['Manicura', 'Uñas', 20, 45, 'Manicura completa con esmaltado tradicional', 1],
      ['Uñas Semipermanentes', 'Uñas', 28, 60, 'Esmaltado semipermanente que dura hasta 3 semanas', 1],
      ['Uñas Acrílicas', 'Uñas', 40, 90, 'Extensión de uñas con acrílico y diseño personalizado', 1],
      ['Nail Art', 'Uñas', 35, 75, 'Diseños artísticos personalizados en tus uñas', 1],
      ['Tratamiento Facial Básico', 'Estética', 40, 60, 'Limpieza facial profunda con hidratación', 1],
      ['Tratamiento Facial Premium', 'Estética', 65, 90, 'Tratamiento completo con mascarilla y masaje facial', 1],
      ['Depilación Cejas', 'Estética', 8, 15, 'Diseño y depilación de cejas', 1],
      ['Depilación Completa', 'Estética', 50, 60, 'Depilación de piernas completas, axilas y zona bikini', 1],
      ['Maquillaje Profesional', 'Estética', 45, 60, 'Maquillaje profesional para eventos especiales', 1]
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertService.run(...item);
      }
    });

    insertMany(services);

    // Slots de ejemplo
    const insertSlot = db.prepare(`
      INSERT INTO slots (id, date, time, available)
      VALUES (?, ?, ?, ?)
    `);

    const days = ['2025-12-22', '2025-12-23', '2025-12-24', '2025-12-26', '2025-12-27', '2025-12-29', '2025-12-30'];
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00'];
    
    const slots = [];
    days.forEach(day => {
      times.forEach(time => {
        slots.push([`${day}-${time}`, day, time, 1]);
      });
    });

    const insertManySlots = db.transaction((items) => {
      for (const item of items) {
        insertSlot.run(...item);
      }
    });

    insertManySlots(slots);

    // Citas de ejemplo
    const insertAppointment = db.prepare(`
      INSERT INTO appointments (slot_id, date, time, client_name, service, service_id, notes, status, total_pagado, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAppointment.run(
      '2025-12-23-10:00',
      '2025-12-23',
      '10:00',
      'María García López',
      'Corte y Tinte',
      3,
      'Prefiero tonos castaños claros',
      'confirmed',
      0,
      new Date('2025-12-20T09:30:00').toISOString(),
      null
    );

    insertAppointment.run(
      '2025-12-24-11:00',
      '2025-12-24',
      '11:00',
      'Laura Martínez Ruiz',
      'Manicura y Diseño de Uñas',
      8,
      'Me gustaría un diseño navideño',
      'confirmed',
      0,
      new Date('2025-12-19T14:20:00').toISOString(),
      null
    );

    const completedId = insertAppointment.run(
      '2025-12-22-16:00',
      '2025-12-22',
      '16:00',
      'Carmen Fernández Silva',
      'Tratamiento Facial',
      12,
      '',
      'completed',
      40,
      new Date('2025-12-20T11:45:00').toISOString(),
      new Date('2025-12-21T17:00:00').toISOString()
    ).lastInsertRowid;

    // Agregar servicio realizado para la cita completada
    db.prepare('INSERT INTO appointment_services (appointment_id, service_id) VALUES (?, ?)').run(completedId, 12);

    // Marcar slots ocupados
    db.prepare('UPDATE slots SET available = 0 WHERE id = ?').run('2025-12-23-10:00');
    db.prepare('UPDATE slots SET available = 0 WHERE id = ?').run('2025-12-24-11:00');
    db.prepare('UPDATE slots SET available = 0 WHERE id = ?').run('2025-12-22-16:00');

    console.log('✅ Datos iniciales insertados correctamente');
  }
};

// Inicializar base de datos
initDB();
seedDatabase();

export const getDb = () => db;
export default db;
