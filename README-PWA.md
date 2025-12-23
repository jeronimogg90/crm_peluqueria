# 📱 PWA Gestión de Peluquería - Lista para iPad

## ✅ Lo que está listo

### 1. **Base de datos persistente (SQLite)**
- ✅ Ubicación: `backend/database/peluqueria.db`
- ✅ Datos se guardan permanentemente
- ✅ Fácil de hacer backup (solo copiar el archivo)

### 2. **PWA instalable en iPad**
- ✅ Manifest.json configurado
- ✅ Service Worker para funcionar offline
- ✅ Íconos de app
- ✅ Meta tags para iOS

### 3. **Backend preparado para producción**
- ✅ Sirve frontend y API desde el mismo servidor
- ✅ Compatible con servicios cloud
- ✅ Variables de entorno configuradas

## 🚀 Próximos pasos para desplegar

### **OPCIÓN 1: Railway.app (Recomendada - ~4€/mes)**

1. **Crear cuenta gratuita**: https://railway.app
2. **Conectar con GitHub**:
   - Crea un repo en GitHub
   - Sube este proyecto
3. **Importar en Railway**:
   - New Project → Deploy from GitHub
   - Selecciona tu repo
4. **Configurar**:
   - Build Command: `./build.sh`
   - Start Command: `cd backend && npm start`
   - Variables: `NODE_ENV=production`
5. **Deploy** → Te da una URL: `https://tu-app.railway.app`

### **OPCIÓN 2: Render.com (Gratis con límites)**

Similar a Railway pero con límites:
- 750 horas/mes gratis
- Se "duerme" si no se usa (tarda 30s en despertar)

### **OPCIÓN 3: Tu Mac en casa (Gratis)**

Si prefieres no pagar hosting:

1. **Obtén tu IP local**:
   ```bash
   ipconfig getifaddr en0
   # Te dará algo como: 192.168.1.100
   ```

2. **Arranca el servidor**:
   ```bash
   cd backend
   npm run dev
   ```

3. **En el iPad (misma WiFi)**:
   - Abre Safari
   - Ve a `http://192.168.1.100:3000`
   - Añadir a pantalla de inicio

**Limitación**: Solo funciona en tu WiFi de casa.

## 📲 Cómo instalar en iPad

Una vez desplegado en Railway/Render:

1. Abre **Safari** en el iPad (no Chrome)
2. Ve a tu URL: `https://tu-app.railway.app`
3. Toca el botón **Compartir** (cuadro con flecha hacia arriba)
4. Selecciona **"Añadir a pantalla de inicio"**
5. Dale un nombre y toca **"Añadir"**
6. ¡Listo! Aparecerá como una app en el iPad

## 📁 Estructura del proyecto

```
crm peluqueria/
├── backend/
│   ├── database/
│   │   └── peluqueria.db       ← Base de datos SQLite
│   ├── data/
│   │   └── db.js               ← Funciones de BD
│   ├── routes/
│   │   ├── appointments.js     ← API citas
│   │   └── services.js         ← API servicios
│   ├── public/                 ← Frontend compilado (producción)
│   └── server.js               ← Servidor Express
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   ← Vista principal
│   │   │   ├── Services.jsx    ← Gestión servicios
│   │   │   └── Billing.jsx     ← Facturación
│   │   └── config/
│   │       └── api.js          ← Configuración API
│   ├── public/
│   │   ├── manifest.json       ← Config PWA
│   │   ├── sw.js               ← Service Worker
│   │   └── icon-*.png          ← Íconos de app
│   └── index.html
├── build.sh                    ← Script de compilación
└── DEPLOY.md                   ← Guía de despliegue
```

## 🔧 Comandos útiles

### Desarrollo local
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Build para producción
```bash
./build.sh
```

### Probar build localmente
```bash
cd backend
NODE_ENV=production npm start
# Abre: http://localhost:3000
```

## 💾 Backup de datos

La base de datos está en: `backend/database/peluqueria.db`

**Para hacer backup**:
```bash
cp backend/database/peluqueria.db backup-$(date +%Y%m%d).db
```

**Para restaurar**:
```bash
cp backup-20250121.db backend/database/peluqueria.db
```

En Railway/Render, conéctate por SSH para hacer backups.

## 🎯 Funcionalidades

✅ **Vista Calendario** - Semana completa con navegación
✅ **Vista Lista Detallada** - Citas agrupadas por día
✅ **Gestión de Servicios** - Crear, editar, eliminar
✅ **Completar Citas** - Seleccionar servicios realizados
✅ **Facturación** - Historial de ingresos y estadísticas
✅ **Responsive** - Funciona en tablet y móvil
✅ **Offline** - Service Worker cachea la app

## 📞 Soporte

Si hay problemas:
1. Revisa los logs en Railway/Render
2. Verifica que SQLite esté funcionando
3. Comprueba que los íconos se generaron correctamente

## 🎨 Personalización

Para cambiar colores, edita:
- `frontend/src/pages/*.css` - Estilos de las páginas
- `frontend/public/manifest.json` - Color de tema de la app
- Variables CSS en los archivos de estilo

## ⚡ Optimizaciones futuras

- [ ] Backups automáticos a Google Drive/Dropbox
- [ ] Notificaciones push de citas
- [ ] Exportar facturas a PDF
- [ ] Sincronización con calendario iOS
- [ ] Multi-idioma

## 🎉 ¡Está todo listo!

La app está preparada para:
1. Funcionar offline en el iPad
2. Guardar datos permanentemente
3. Ser desplegada en la nube con 1 click
4. Instalarse como app nativa en iPad

**Recomendación**: Empieza con Railway.app por ~4€/mes. Es la opción más simple y fiable.
