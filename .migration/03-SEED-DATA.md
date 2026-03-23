# Tarea 3: Insertar Datos de Ejemplo (Seed)

## Objetivo
Insertar los datos iniciales (servicios, slots, citas de ejemplo) en Supabase.

## SQL a ejecutar en Supabase Dashboard > SQL Editor

```sql
-- =============================================
-- SEED DATA - CRM PELUQUERIA
-- =============================================

-- SERVICIOS (16 servicios)
INSERT INTO services (name, category, price, duration, description, active) VALUES
  ('Corte de Pelo Mujer', 'Peluquería', 25, 45, 'Corte personalizado con lavado y secado incluido', true),
  ('Corte de Pelo Hombre', 'Peluquería', 15, 30, 'Corte de caballero con acabado profesional', true),
  ('Tinte Completo', 'Peluquería', 45, 90, 'Coloración completa con productos de calidad', true),
  ('Mechas', 'Peluquería', 55, 120, 'Mechas personalizadas con técnicas modernas', true),
  ('Tratamiento Keratina', 'Peluquería', 80, 120, 'Alisado brasileño con keratina', true),
  ('Peinado Especial', 'Peluquería', 35, 60, 'Peinado para eventos y ocasiones especiales', true),
  ('Lavado y Secado', 'Peluquería', 15, 30, 'Lavado profesional con secado incluido', true),
  ('Manicura', 'Uñas', 20, 45, 'Manicura completa con esmaltado tradicional', true),
  ('Uñas Semipermanentes', 'Uñas', 28, 60, 'Esmaltado semipermanente que dura hasta 3 semanas', true),
  ('Uñas Acrílicas', 'Uñas', 40, 90, 'Extensión de uñas con acrílico y diseño personalizado', true),
  ('Nail Art', 'Uñas', 35, 75, 'Diseños artísticos personalizados en tus uñas', true),
  ('Tratamiento Facial Básico', 'Estética', 40, 60, 'Limpieza facial profunda con hidratación', true),
  ('Tratamiento Facial Premium', 'Estética', 65, 90, 'Tratamiento completo con mascarilla y masaje facial', true),
  ('Depilación Cejas', 'Estética', 8, 15, 'Diseño y depilación de cejas', true),
  ('Depilación Completa', 'Estética', 50, 60, 'Depilación de piernas completas, axilas y zona bikini', true),
  ('Maquillaje Profesional', 'Estética', 45, 60, 'Maquillaje profesional para eventos especiales', true);

-- SLOTS DE TIEMPO (7 dias x 9 horarios = 63 slots)
INSERT INTO slots (id, date, time, available) VALUES
  ('2025-12-22-09:00', '2025-12-22', '09:00', true),
  ('2025-12-22-10:00', '2025-12-22', '10:00', true),
  ('2025-12-22-11:00', '2025-12-22', '11:00', true),
  ('2025-12-22-12:00', '2025-12-22', '12:00', true),
  ('2025-12-22-13:00', '2025-12-22', '13:00', true),
  ('2025-12-22-16:00', '2025-12-22', '16:00', false),
  ('2025-12-22-17:00', '2025-12-22', '17:00', true),
  ('2025-12-22-18:00', '2025-12-22', '18:00', true),
  ('2025-12-22-19:00', '2025-12-22', '19:00', true),
  ('2025-12-23-09:00', '2025-12-23', '09:00', true),
  ('2025-12-23-10:00', '2025-12-23', '10:00', false),
  ('2025-12-23-11:00', '2025-12-23', '11:00', true),
  ('2025-12-23-12:00', '2025-12-23', '12:00', true),
  ('2025-12-23-13:00', '2025-12-23', '13:00', true),
  ('2025-12-23-16:00', '2025-12-23', '16:00', true),
  ('2025-12-23-17:00', '2025-12-23', '17:00', true),
  ('2025-12-23-18:00', '2025-12-23', '18:00', true),
  ('2025-12-23-19:00', '2025-12-23', '19:00', true),
  ('2025-12-24-09:00', '2025-12-24', '09:00', true),
  ('2025-12-24-10:00', '2025-12-24', '10:00', true),
  ('2025-12-24-11:00', '2025-12-24', '11:00', false),
  ('2025-12-24-12:00', '2025-12-24', '12:00', true),
  ('2025-12-24-13:00', '2025-12-24', '13:00', true),
  ('2025-12-24-16:00', '2025-12-24', '16:00', true),
  ('2025-12-24-17:00', '2025-12-24', '17:00', true),
  ('2025-12-24-18:00', '2025-12-24', '18:00', true),
  ('2025-12-24-19:00', '2025-12-24', '19:00', true),
  ('2025-12-26-09:00', '2025-12-26', '09:00', true),
  ('2025-12-26-10:00', '2025-12-26', '10:00', true),
  ('2025-12-26-11:00', '2025-12-26', '11:00', true),
  ('2025-12-26-12:00', '2025-12-26', '12:00', true),
  ('2025-12-26-13:00', '2025-12-26', '13:00', true),
  ('2025-12-26-16:00', '2025-12-26', '16:00', true),
  ('2025-12-26-17:00', '2025-12-26', '17:00', true),
  ('2025-12-26-18:00', '2025-12-26', '18:00', true),
  ('2025-12-26-19:00', '2025-12-26', '19:00', true),
  ('2025-12-27-09:00', '2025-12-27', '09:00', true),
  ('2025-12-27-10:00', '2025-12-27', '10:00', true),
  ('2025-12-27-11:00', '2025-12-27', '11:00', true),
  ('2025-12-27-12:00', '2025-12-27', '12:00', true),
  ('2025-12-27-13:00', '2025-12-27', '13:00', true),
  ('2025-12-27-16:00', '2025-12-27', '16:00', true),
  ('2025-12-27-17:00', '2025-12-27', '17:00', true),
  ('2025-12-27-18:00', '2025-12-27', '18:00', true),
  ('2025-12-27-19:00', '2025-12-27', '19:00', true),
  ('2025-12-29-09:00', '2025-12-29', '09:00', true),
  ('2025-12-29-10:00', '2025-12-29', '10:00', true),
  ('2025-12-29-11:00', '2025-12-29', '11:00', true),
  ('2025-12-29-12:00', '2025-12-29', '12:00', true),
  ('2025-12-29-13:00', '2025-12-29', '13:00', true),
  ('2025-12-29-16:00', '2025-12-29', '16:00', true),
  ('2025-12-29-17:00', '2025-12-29', '17:00', true),
  ('2025-12-29-18:00', '2025-12-29', '18:00', true),
  ('2025-12-29-19:00', '2025-12-29', '19:00', true),
  ('2025-12-30-09:00', '2025-12-30', '09:00', true),
  ('2025-12-30-10:00', '2025-12-30', '10:00', true),
  ('2025-12-30-11:00', '2025-12-30', '11:00', true),
  ('2025-12-30-12:00', '2025-12-30', '12:00', true),
  ('2025-12-30-13:00', '2025-12-30', '13:00', true),
  ('2025-12-30-16:00', '2025-12-30', '16:00', true),
  ('2025-12-30-17:00', '2025-12-30', '17:00', true),
  ('2025-12-30-18:00', '2025-12-30', '18:00', true),
  ('2025-12-30-19:00', '2025-12-30', '19:00', true);

-- CITAS DE EJEMPLO (3 citas)
INSERT INTO appointments (slot_id, date, time, client_name, service, service_id, notes, status, total_pagado, created_at, completed_at)
VALUES
  ('2025-12-23-10:00', '2025-12-23', '10:00', 'María García López', 'Corte y Tinte', 3, 'Prefiero tonos castaños claros', 'confirmed', 0, '2025-12-20T09:30:00.000Z', NULL),
  ('2025-12-24-11:00', '2025-12-24', '11:00', 'Laura Martínez Ruiz', 'Manicura y Diseño de Uñas', 8, 'Me gustaría un diseño navideño', 'confirmed', 0, '2025-12-19T14:20:00.000Z', NULL),
  ('2025-12-22-16:00', '2025-12-22', '16:00', 'Carmen Fernández Silva', 'Tratamiento Facial', 12, '', 'completed', 40, '2025-12-20T11:45:00.000Z', '2025-12-21T17:00:00.000Z');

-- SERVICIO REALIZADO para la cita completada (id=3)
INSERT INTO appointment_services (appointment_id, service_id) VALUES (3, 12);
```

## Verificacion
- Comprobar en Table Editor que `services` tiene 16 filas
- Comprobar que `slots` tiene 63 filas (3 con available=false)
- Comprobar que `appointments` tiene 3 filas (1 completed, 2 confirmed)
- Comprobar que `appointment_services` tiene 1 fila

## Criterios de aceptacion
- [ ] 16 servicios insertados en 3 categorias
- [ ] 63 slots insertados, 3 marcados como no disponibles
- [ ] 3 citas de ejemplo insertadas
- [ ] 1 servicio realizado vinculado a la cita completada
