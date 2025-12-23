# 🚀 Inicio Rápido: Sincronización con Google Calendar

## ✅ Configuración Completada

Ya has configurado:
- ✅ Google Cloud Console y credenciales OAuth
- ✅ Variables de entorno en backend/.env
- ✅ Botón de sincronización en el Dashboard

## 📝 Proceso de Primera Sincronización

### Paso 1: Ir al Dashboard
1. Abre tu navegador en `http://localhost:5173`
2. Inicia sesión como administrador
3. Ve a la sección de **Citas**

### Paso 2: Hacer clic en "Sincronizar"
1. Busca el botón verde **"🔄 Sincronizar Google Calendar"** (junto a los botones Calendario/Semanal/Lista)
2. Haz clic en él
3. **Primera vez:** Se abrirá una ventana popup para autorización

### Paso 3: Autorizar Google Calendar
En la ventana popup:
1. Selecciona tu cuenta de Google (la que tiene el calendario de la peluquería)
2. Revisa los permisos:
   - ✅ "Ver eventos que crees en Google Calendar"
   - ✅ Solo lectura (no modifica tu calendario)
3. Haz clic en **"Continuar"** o **"Permitir"**
4. La ventana se cerrará automáticamente

### Paso 4: Sincronización Automática
- Después de autorizar, el sistema **sincroniza automáticamente**
- Verás un mensaje: "Sincronización completada: X eventos de trabajo, Y eventos regulares"
- **Si hay eventos de trabajo** (citas de clientes), se abrirá el modal de conversión automáticamente

### Paso 5: Convertir Eventos de Trabajo (si aplica)
Si aparece el modal:
1. **Panel izquierdo:** Muestra el evento de Google
2. **Panel derecho:** Formulario de cita
3. **Opciones:**
   - **"Convertir y Siguiente"**: Crea la cita y pasa al siguiente
   - **"Omitir"**: Descarta este evento
4. El modal muestra "Evento X de Y" para saber cuántos quedan

### Paso 6: Ver Eventos en el Calendario
- **Eventos regulares** (verde claro): Se ven en el calendario para saber disponibilidad
- **Citas convertidas** (morado): Aparecen como citas normales del sistema

## 🔄 Sincronizaciones Posteriores

Para sincronizar de nuevo (traer eventos nuevos):
1. Simplemente haz clic en **"🔄 Sincronizar Google Calendar"**
2. **No necesitas autorizar de nuevo** (los tokens se guardan)
3. Solo trae eventos **nuevos o modificados** desde la última sincronización

## ❌ Solución Rápida de Problemas

### "Error: No access, refresh token..."
**Causa:** Es tu primera vez, necesitas autorizar
**Solución:** 
- El sistema abrirá automáticamente la ventana de autorización
- Si no se abre, verifica que tu navegador no esté bloqueando popups
- Después de autorizar, vuelve al Dashboard (debería sincronizar automáticamente)

### No se abre la ventana de autorización
**Solución:**
- Verifica que el navegador no bloquee popups
- Busca el ícono de popup bloqueado en la barra de direcciones
- Permite popups para `localhost:5173`

### La ventana se abre pero da error
**Causa:** Problema con credenciales de Google
**Solución:**
1. Verifica que el `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `backend/.env` sean correctos
2. Verifica en Google Cloud Console que:
   - La Google Calendar API esté habilitada
   - Las URIs de redirección incluyan: `http://localhost:3000/api/google/callback`
   - Las URIs autorizadas incluyan: `http://localhost:5173`

### "Autenticación requerida" después de días sin usar
**Causa:** Token expirado (normal después de tiempo sin usar)
**Solución:** 
- Haz clic en "Sincronizar" de nuevo
- Se abrirá la ventana de autorización
- Vuelve a autorizar y listo

## 🎨 Colores en el Calendario

| Elemento | Color | Descripción |
|----------|-------|-------------|
| Citas del CRM | 🟣 Morado | Citas creadas o convertidas en tu sistema |
| Eventos Google | 🟢 Verde | Eventos de tu Google Calendar (visuales) |
| Día actual | 🔵 Azul | Borde azul en el día de hoy |

## 📊 Qué Eventos se Consideran "de Trabajo"

El sistema detecta automáticamente eventos de trabajo si el **título o descripción** contiene palabras como:
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

**Ejemplo:**
- ✅ "Cita con María López - Corte" → Es de trabajo (aparece en modal)
- ❌ "Almuerzo con amigas" → No es de trabajo (solo se ve en calendario)

## 💡 Consejos

1. **Sincroniza regularmente:** Haz clic en sincronizar cada mañana para traer eventos nuevos
2. **Usa palabras clave:** En Google Calendar, incluye palabras como "cita" o "cliente" para que el sistema detecte eventos de trabajo
3. **Eventos regulares útiles:** Los eventos regulares (verde) te ayudan a ver cuando tienes ocupado el día con cosas personales
4. **No duplica eventos:** Puedes sincronizar múltiples veces, no se duplicarán eventos

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Abre la consola del navegador (F12) y busca errores en rojo
2. Verifica que ambos servidores estén corriendo:
   - Backend: `http://localhost:3000` (debe mostrar "📋 API disponible en...")
   - Frontend: `http://localhost:5173`
3. Revisa los logs del servidor backend en la terminal

## ✨ ¡Listo!

Ya estás configurado. Solo haz clic en **"🔄 Sincronizar Google Calendar"** y autoriza en la ventana popup que se abre.

Después de la autorización, el sistema sincronizará automáticamente y si hay eventos de trabajo, te mostrará el modal para convertirlos en citas. 🎉
