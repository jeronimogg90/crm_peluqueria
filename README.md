# 💇‍♀️ Sistema de Reservas - Salón de Belleza

Sistema completo de gestión de citas para peluquería, estética y diseño de uñas. Incluye frontend en React y backend API en Node.js/Express.

## ✨ Características

- 🏠 **Página de inicio** profesional con información del negocio
- 🖼️ **Galería de imágenes** para mostrar trabajos realizados
- 📅 **Sistema de reservas** con selección de horarios disponibles
- 📧 **Notificaciones por email** automáticas
- 👩‍💼 **Dashboard de administración** para gestionar citas
- ✅ **Aprobación/Rechazo** de citas con emails automáticos

## 🏗️ Estructura del Proyecto

```
crm peluqueria/
├── backend/          # API Node.js/Express
│   ├── config/       # Configuración de email
│   ├── data/         # Base de datos simulada
│   ├── routes/       # Rutas de la API
│   └── server.js     # Servidor principal
└── frontend/         # Aplicación React
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── pages/        # Páginas de la aplicación
    │   └── config/       # Configuración API
    └── public/           # Archivos estáticos
```

## 🚀 Instalación y Configuración

### Backend (API)

1. **Navegar a la carpeta del backend:**
```bash
cd backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Copia el archivo `.env.example` a `.env` y configura tus datos:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
PORT=3000

# Configuración de Email (ejemplo con Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=tu-email@gmail.com

# Email del negocio (donde llegarán las notificaciones)
BUSINESS_EMAIL=email-del-salon@gmail.com
```

> **Nota para Gmail:** Necesitas generar una "contraseña de aplicación":
> 1. Ve a tu cuenta de Google
> 2. Seguridad → Verificación en dos pasos (actívala)
> 3. Contraseñas de aplicaciones → Genera una nueva
> 4. Usa esa contraseña en `EMAIL_PASS`

4. **Iniciar el servidor:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Frontend (React)

1. **Navegar a la carpeta del frontend:**
```bash
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno (opcional):**
```bash
cp .env.example .env
```

Por defecto, se conectará a `http://localhost:3000/api`

4. **Iniciar la aplicación:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📖 Uso

### Para Clientes

1. **Ver la galería:** Navega a la sección "Galería" para ver trabajos realizados
2. **Reservar cita:**
   - Ve a "Reservar Cita"
   - Selecciona un horario disponible
   - Completa el formulario con tus datos
   - Recibirás un email cuando se apruebe tu cita

### Para la Administradora

1. **Acceder al dashboard:** Ve a `http://localhost:5173/admin`
2. **Gestionar citas:**
   - Ver todas las solicitudes pendientes
   - Aprobar citas (envía email de confirmación al cliente)
   - Rechazar citas (envía email al cliente con motivo)
   - Filtrar por estado (pendientes, aprobadas, rechazadas)

## 🛠️ API Endpoints

### Slots Disponibles
```
GET /api/slots
```
Obtiene todos los horarios disponibles

### Crear Cita
```
POST /api/appointments
```
Body:
```json
{
  "slotId": "2024-12-23-09:00",
  "date": "2024-12-23",
  "time": "09:00",
  "clientName": "María García",
  "clientEmail": "maria@example.com",
  "clientPhone": "612345678",
  "service": "Corte de Pelo",
  "notes": "Opcional"
}
```

### Listar Citas
```
GET /api/appointments
```

### Aprobar Cita
```
PATCH /api/appointments/:id/approve
```

### Rechazar Cita
```
PATCH /api/appointments/:id/reject
```
Body:
```json
{
  "reason": "Motivo del rechazo (opcional)"
}
```

## 🎨 Personalización

### Cambiar Imágenes de la Galería

Edita el archivo `frontend/src/pages/Gallery.jsx` y reemplaza las URLs de las imágenes:

```javascript
const [images] = useState([
  {
    id: 1,
    url: 'URL_DE_TU_IMAGEN',
    title: 'Título',
    category: 'Peluquería'
  },
  // ... más imágenes
]);
```

### Modificar Servicios Disponibles

Edita `frontend/src/pages/Booking.jsx`:

```javascript
const services = [
  'Corte de Pelo',
  'Tinte/Mechas',
  // ... tus servicios
];
```

### Configurar Horarios Disponibles

Edita `backend/data/db.js` en la función `generateDefaultSlots()`:

```javascript
const days = ['2024-12-23', '2024-12-24', ...];
const times = ['09:00', '10:00', '11:00', ...];
```

## 🗄️ Base de Datos

Actualmente usa una base de datos en memoria (los datos se pierden al reiniciar el servidor). Para producción, considera migrar a:

- **MongoDB** (NoSQL)
- **PostgreSQL** (SQL)
- **MySQL** (SQL)

## 🚀 Despliegue en Producción

### Backend
- **Render**, **Railway**, **Heroku**: Plataformas para Node.js
- Configura las variables de entorno
- Cambia el puerto según requiera la plataforma

### Frontend
- **Vercel**, **Netlify**, **Cloudflare Pages**: Ideales para React
- Actualiza `VITE_API_URL` con la URL de tu API en producción
- Ejecuta `npm run build` para generar los archivos de producción

## 📝 Notas Importantes

1. **Seguridad:** El dashboard (`/admin`) no tiene autenticación. Para producción, implementa un sistema de login
2. **Base de datos:** Los datos actuales son volátiles. Implementa una BD real para producción
3. **Emails:** Verifica que tu proveedor de email permita envíos automáticos
4. **Horarios:** Los slots se generan una sola vez. Considera crear un sistema para agregar fechas futuras automáticamente

## 🤝 Soporte

Si tienes problemas:

1. Verifica que ambos servidores estén corriendo (backend puerto 3000, frontend puerto 5173)
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor backend
4. Asegúrate de que las variables de entorno estén configuradas correctamente

## 📄 Licencia

Este proyecto es de uso personal. Puedes modificarlo según tus necesidades.

---

¡Hecho con ❤️ para tu salón de belleza!
