import { google } from 'googleapis';
import { getGoogleSyncConfig, saveGoogleSyncConfig } from '../data/db.js';

// Configuración OAuth2
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Crear cliente OAuth2
export const createOAuth2Client = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback'
  );

  // Cargar tokens si existen
  const config = await getGoogleSyncConfig();
  if (config && config.access_token) {
    oauth2Client.setCredentials({
      access_token: config.access_token,
      refresh_token: config.refresh_token,
      expiry_date: config.token_expiry ? new Date(config.token_expiry).getTime() : null
    });
  }

  return oauth2Client;
};

// Generar URL de autenticación
export const getAuthUrl = async () => {
  const oauth2Client = await createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

// Obtener tokens desde código de autorización
export const getTokensFromCode = async (code) => {
  const oauth2Client = await createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  
  oauth2Client.setCredentials(tokens);
  
  // Guardar tokens en BD
  await saveGoogleSyncConfig({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    lastSyncDate: new Date().toISOString()
  });
  
  return tokens;
};

// Sincronizar eventos desde Google Calendar
export const syncCalendarEvents = async () => {
  const oauth2Client = await createOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const config = await getGoogleSyncConfig();
  
  // Determinar fecha de inicio (última sync o hace 30 días)
  let timeMin;
  if (config && config.last_sync_date) {
    timeMin = new Date(config.last_sync_date).toISOString();
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    timeMin = thirtyDaysAgo.toISOString();
  }

  try {
    // Obtener lista de calendarios, incluyendo ocultos
    const calendarList = await calendar.calendarList.list({ showHidden: true });
    const calendars = calendarList.data.items || [];
    
    console.log('📅 Calendarios encontrados:', calendars.map(c => c.summary).join(', '));
    
    const allEvents = [];
    
    // Sincronizar eventos de cada calendario
    for (const cal of calendars) {
      try {
        const response = await calendar.events.list({
          calendarId: cal.id,
          timeMin: timeMin,
          maxResults: 2500,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const events = response.data.items || [];
        
        // Agregar información del calendario a cada evento
        events.forEach(event => {
          event.calendarName = cal.summary;
          event.calendarId = cal.id;
        });
        
        console.log(`  📋 "${cal.summary}": descargados ${events.length} eventos`);
        allEvents.push(...events);
      } catch (error) {
        console.error(`❌ Error sincronizando calendario "${cal.summary}":`, error.message);
      }
    }
    
    // Actualizar última fecha de sincronización
    await saveGoogleSyncConfig({
      ...config,
      lastSyncDate: new Date().toISOString()
    });

    return allEvents;
  } catch (error) {
    console.error('Error sincronizando con Google Calendar:', error);
    throw error;
  }
};

// Detectar el tipo de calendario basado en el NOMBRE del calendario
export const detectCalendarType = (calendarName) => {
  if (!calendarName) return 'casa';
  
  const name = calendarName.toLowerCase();
  
  // Detectar por nombre del calendario
  if (name.includes('trabajo') || name.includes('work') || name.includes('peluquería') || name.includes('peluqueria') || name.includes('anavarromarc')) {
    return 'trabajo';
  }
  
  if (name.includes('médico') || name.includes('medico') || name.includes('health') || name.includes('salud') || name.includes('doctor')) {
    return 'medicos';
  }
  
  // Por defecto es casa
  return 'casa';
};

// Determinar si un evento es de trabajo (basado en el calendario y en el título)
export const isWorkEvent = (event, calendarType) => {
  const title = (event.summary || '').toLowerCase();
  
  // Ignorar siempre cumpleaños y festivos, incluso si están en el calendario principal
  if (title.includes('cumpleaños') || title.includes('festivo') || title.includes('holiday')) {
    return false;
  }

  // Si el evento está en el calendario de trabajo, es un evento de trabajo
  if (calendarType === 'trabajo') {
    return true;
  }
  
  // Buscar palabras clave en el título
  if (title.includes('trabajo') || 
      title.includes('peluqueria') || 
      title.includes('peluquería') ||
      title.includes('cita') || 
      title.includes('corte') || 
      title.includes('tinte')) {
    return true;
  }
  
  return false;
};

// Formatear evento de Google para nuestra BD
export const formatGoogleEvent = (event) => {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Formatear fecha como YYYY-MM-DD
  const date = startDate.toISOString().split('T')[0];
  
  // Formatear hora como HH:MM
  const startTime = event.start.dateTime 
    ? startDate.toTimeString().substring(0, 5)
    : '00:00';
  
  const endTime = event.end.dateTime
    ? endDate.toTimeString().substring(0, 5)
    : '23:59';
  
  // Extraer asistentes
  const attendees = event.attendees 
    ? event.attendees.map(a => a.email).join(', ')
    : null;
  
  // Detectar tipo de calendario por el NOMBRE del calendario
  const calendarType = detectCalendarType(event.calendarName);
  
  return {
    googleEventId: event.id,
    summary: event.summary || 'Sin título',
    description: event.description || null,
    startTime,
    endTime,
    date,
    location: event.location || null,
    attendees,
    calendarType,
    isWorkEvent: isWorkEvent(event, calendarType)
  };
};
