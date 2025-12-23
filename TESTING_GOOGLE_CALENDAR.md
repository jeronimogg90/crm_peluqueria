# Guía de Prueba: Integración con Google Calendar

## 📋 Resumen de la Integración

La integración con Google Calendar permite:
- **Sincronizar eventos** desde Google Calendar a tu CRM
- **Detectar eventos de trabajo** automáticamente (citas de clientes)
- **Convertir eventos** de trabajo en citas del sistema usando un modal de transferencia
- **Mostrar eventos regulares** en el calendario para ver disponibilidad
- **Sincronización incremental** solo trae eventos nuevos desde la última sincronización

## 🔧 Configuración Previa

### 1. Configurar Google Cloud Console

Sigue la guía completa en `GOOGLE_CALENDAR_SETUP.md` para:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API
3. Configurar pantalla de consentimiento OAuth
4. Crear credenciales de cliente web OAuth 2.0
5. Configurar URIs autorizadas y de redirección

### 2. Configurar Variables de Entorno

En `backend/.env` agrega:

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback
```

**⚠️ IMPORTANTE:** No commitees el archivo `.env` con credenciales reales a Git.

### 3. Verificar Instalación de Dependencias

El backend ya tiene instalado:
- `googleapis@169.0.0` - Cliente de Google APIs

Si necesitas reinstalar:
```bash
cd backend
npm install googleapis
```

## 🧪 Pasos para Probar

### Paso 1: Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Paso 2: Acceder al Dashboard

1. Abre el navegador en `http://localhost:5173`
2. Inicia sesión como administrador
3. Ve a la sección de Citas (Dashboard)

### Paso 3: Primera Sincronización

1. **Busca el botón** "🔄 Sincronizar Google Calendar" en la barra de controles (junto a los botones Calendario/Semanal/Lista)

2. **Haz clic** en el botón de sincronización

3. **Autorización OAuth:**
   - Si es la primera vez, se abrirá una ventana popup
   - Selecciona tu cuenta de Google
   - Acepta los permisos solicitados (solo lectura de calendario)
   - La ventana se cerrará automáticamente

4. **Proceso de sincronización:**
   - El botón mostrará "🔄 Sincronizando..."
   - Se traerán todos los eventos de los últimos 30 días
   - Los eventos se clasificarán en:
     - **Eventos de trabajo:** Contienen palabras clave (cita, cliente, corte, tinte, etc.)
     - **Eventos regulares:** Todo lo demás

### Paso 4: Modal de Conversión de Eventos

Si hay eventos de trabajo detectados:

1. **Se abrirá automáticamente** el modal de transferencia a pantalla completa

2. **Panel izquierdo** muestra el evento de Google Calendar:
   - Título del evento
   - Descripción
   - Fecha y hora
   - Duración

3. **Panel derecho** muestra el formulario de cita:
   - Cliente (autocompletado desde el título si es posible)
   - Servicio
   - Fecha (pre-rellenada)
   - Hora (pre-rellenada)
   - Notas (con descripción del evento)

4. **Acciones disponibles:**
   - **"Convertir y Siguiente"**: Crea la cita y pasa al siguiente evento
   - **"Omitir"**: Descarta este evento y pasa al siguiente

5. **Indicador de progreso:** "Evento X de Y"

### Paso 5: Verificar Eventos en el Calendario

Después de la sincronización:

#### Vista de Calendario Mensual
- Los **eventos regulares de Google** aparecen con fondo verde claro y borde verde
- Las **citas del CRM** aparecen con fondo morado (gradiente)
- Puedes ver ambos tipos de eventos en cada día

#### Vista Semanal
- Los **eventos de Google** aparecen como tarjetas con borde verde
- Las **citas del CRM** aparecen con sus colores de estado
- Ambos ordenados por hora

#### Vista de Lista Detallada
- Los **eventos de Google** tienen:
  - Badge verde "Google Calendar"
  - Ícono 📅
  - Fondo verde claro
  - Borde verde a la izquierda
- Las **citas del CRM** mantienen su diseño original

### Paso 6: Sincronizaciones Posteriores

En sincronizaciones siguientes:
- Solo se traen eventos **nuevos o modificados** desde la última sincronización
- El sistema guarda la fecha de última sincronización
- Más eficiente y rápido

## 🎨 Indicadores Visuales

### Eventos de Google Calendar
- **Color:** Verde (#34a853) - Color oficial de Google Calendar
- **Estilo:** Fondo verde claro, borde izquierdo verde sólido
- **Ícono:** 📅 para diferenciar de citas

### Citas del CRM
- **Color:** Morado (gradiente #667eea a #764ba2)
- **Estilo:** Diseño original del sistema
- **Íconos:** 💇‍♀️ y badges de estado

### Botón de Sincronización
- **Normal:** Verde con gradiente
- **Sincronizando:** Texto "🔄 Sincronizando..." con botón deshabilitado
- **Ubicación:** Junto a botones de vista (Calendario/Semanal/Lista)

## 🔍 Detección de Eventos de Trabajo

El sistema detecta automáticamente eventos de trabajo buscando estas palabras clave:
- cita
- cliente
- corte
- tinte
- mechas
- manicura
- pedicura
- uñas
- facial
- tratamiento
- depilación

**Nota:** La búsqueda es case-insensitive y busca en título y descripción del evento.

## 🗄️ Almacenamiento

### Base de Datos SQLite

Dos nuevas tablas:

1. **google_sync_config**: Guarda tokens OAuth y fecha de última sincronización
2. **google_events**: Almacena eventos temporalmente hasta ser convertidos o descartados

### Flujo de Datos

```
Google Calendar 
    → API Sync 
    → google_events (temp storage)
    → Clasificación (work/regular)
    → Modal de conversión (work events)
    → appointments (after conversion)
```

## 🐛 Solución de Problemas

### El botón no aparece
- Verifica que estés en la página de Dashboard/Citas
- Busca en la barra de controles junto a los botones de vista

### No se abre la ventana de autorización
- Verifica que el navegador no esté bloqueando popups
- Revisa las credenciales en `backend/.env`
- Comprueba que las URIs de redirección coincidan en Google Cloud Console

### No se sincronizan eventos
- Abre la consola del navegador (F12) y busca errores
- Verifica que el backend esté corriendo
- Revisa los logs del servidor backend
- Confirma que la Google Calendar API esté habilitada

### Los eventos no se clasifican correctamente
- Revisa las palabras clave en `backend/services/googleCalendar.js` función `isWorkEvent()`
- Ajusta las palabras clave según tus necesidades

### Errores de token expirado
- El sistema renueva tokens automáticamente
- Si falla, tendrás que reautorizar haciendo clic en el botón de sincronización

## 📊 API Endpoints

Disponibles para testing manual:

```bash
# Obtener URL de autorización
GET http://localhost:5000/api/google/auth-url

# Sincronizar eventos
POST http://localhost:5000/api/google/sync

# Obtener eventos de trabajo pendientes
GET http://localhost:5000/api/google/work-events

# Obtener todos los eventos de Google
GET http://localhost:5000/api/google/events

# Marcar evento como convertido
PATCH http://localhost:5000/api/google/events/:id/convert

# Eliminar evento
DELETE http://localhost:5000/api/google/events/:id
```

## ✅ Checklist de Prueba

- [ ] Configuración de Google Cloud Console completada
- [ ] Variables de entorno configuradas en backend/.env
- [ ] Servidores frontend y backend corriendo
- [ ] Botón de sincronización visible en Dashboard
- [ ] Popup de autorización OAuth funciona
- [ ] Primera sincronización trae eventos (verificar en consola)
- [ ] Modal de conversión aparece para eventos de trabajo
- [ ] Se puede convertir evento a cita
- [ ] Se puede omitir evento
- [ ] Eventos regulares aparecen en vista mensual
- [ ] Eventos regulares aparecen en vista semanal
- [ ] Eventos regulares aparecen en vista de lista
- [ ] Eventos tienen estilo verde distintivo
- [ ] Segunda sincronización solo trae eventos nuevos
- [ ] La cita creada aparece en el calendario junto con eventos Google

## 🎯 Casos de Prueba Sugeridos

### Caso 1: Evento de Trabajo Típico
Crea en Google Calendar:
- **Título:** "Cita con María - Corte y Tinte"
- **Descripción:** "Cliente habitual, color castaño"
- **Hora:** Mañana a las 10:00
- **Resultado esperado:** Aparece en modal de conversión

### Caso 2: Evento Regular
Crea en Google Calendar:
- **Título:** "Reunión familiar"
- **Descripción:** "Almuerzo en casa de mamá"
- **Hora:** Mañana a las 14:00
- **Resultado esperado:** Aparece en calendario con estilo verde

### Caso 3: Múltiples Eventos Mixtos
Crea 3 eventos de trabajo y 2 eventos regulares
- **Resultado esperado:** 
  - Modal muestra "Evento 1 de 3"
  - Eventos regulares aparecen directamente en calendario
  - Puedes convertir los 3 eventos de trabajo uno por uno

## 🔐 Seguridad

- Tokens OAuth guardados en base de datos local (SQLite)
- No se envían credenciales al frontend
- Scope limitado a lectura de calendario (`calendar.readonly`)
- Refresh token permite renovación automática sin reautorización

## 📝 Notas Adicionales

- Los eventos de Google **no se eliminan** del calendario original
- La conversión crea una **copia** como cita en el CRM
- Los eventos regulares son **solo visuales**, no crean registros en appointments
- La sincronización **no es en tiempo real**, debes hacer clic en el botón para actualizar
- Puedes sincronizar **múltiples veces** sin duplicar eventos (se usa google_event_id único)

---

## 🚀 Próximos Pasos

Después de verificar que todo funciona:

1. **Configurar producción:** 
   - Usa HTTPS en producción
   - Actualiza URIs de redirección en Google Cloud Console
   - Configura variables de entorno en servidor de producción

2. **Personalizar detección:**
   - Ajusta palabras clave en `isWorkEvent()` según tu negocio
   - Considera agregar más campos al modal de conversión

3. **Mejorar UX:**
   - Agregar notificaciones cuando hay nuevos eventos de trabajo
   - Badge con contador de eventos pendientes de conversión
   - Sincronización automática periódica (opcional)

¡Disfruta de tu integración con Google Calendar! 🎉
