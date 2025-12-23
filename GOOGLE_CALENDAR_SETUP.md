# Configuración de Google Calendar API

Para habilitar la sincronización con Google Calendar, sigue estos pasos:

## 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Calendar API"
   - Haz clic en "Habilitar"

## 2. Configurar OAuth 2.0

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "+ CREAR CREDENCIALES" > "ID de cliente de OAuth"
3. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo de usuario: **Externo**
   - Nombre de la aplicación: "CRM Peluquería"
   - Correo de asistencia: tu email
   - Ámbitos: No agregar ninguno por ahora
   - Usuarios de prueba: Añade tu email de Google

4. Vuelve a "Credenciales" > "+ CREAR CREDENCIALES" > "ID de cliente de OAuth"
5. Tipo de aplicación: **Aplicación web**
6. Nombre: "CRM Peluquería Web"
7. Orígenes de JavaScript autorizados:
   ```
   http://localhost:5173
   http://localhost:3000
   ```
8. URIs de redireccionamiento autorizados:
   ```
   http://localhost:3000/api/google/callback
   ```
9. Haz clic en "CREAR"

## 3. Copiar Credenciales

Después de crear, verás un modal con:
- **Client ID**: Algo como `xxxxx.apps.googleusercontent.com`
- **Client Secret**: Una cadena aleatoria

Copia estos valores.

## 4. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y añade tus credenciales:
   ```env
   GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
   ```

## 5. Reiniciar Servidor

Reinicia el servidor backend para que cargue las nuevas variables:

```bash
npm run start
```

## 6. Autorizar la Aplicación

1. En el dashboard, haz clic en **"🔄 Sincronizar con Google Calendar"**
2. Se abrirá una ventana para autorizar el acceso
3. Selecciona tu cuenta de Google
4. Acepta los permisos solicitados
5. La sincronización comenzará automáticamente

## Notas Importantes

- **Primera sincronización**: Traerá eventos de los últimos 30 días
- **Sincronizaciones posteriores**: Solo traerá eventos nuevos desde la última sync
- **Eventos de trabajo**: Se detectan automáticamente por palabras clave (cita, cliente, corte, tinte, etc.)
- **Eventos regulares**: Se muestran en el calendario solo para referencia visual
- **Eventos de trabajo**: Se abre un modal para convertirlos en citas del sistema

## Palabras Clave para Eventos de Trabajo

Los siguientes términos en el título o descripción marcan un evento como "de trabajo":
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

Puedes editar estas palabras en `backend/services/googleCalendar.js` función `isWorkEvent()`.

## Solución de Problemas

### Error "invalid_grant"
- Las credenciales han expirado
- Haz clic nuevamente en "Sincronizar" para re-autorizar

### Error "redirect_uri_mismatch"
- Verifica que la URI de redirección en Google Console coincida exactamente con `GOOGLE_REDIRECT_URI` en tu `.env`

### No se detectan eventos de trabajo
- Verifica que los títulos de los eventos contengan alguna de las palabras clave
- Revisa la configuración en el código si usas términos diferentes
