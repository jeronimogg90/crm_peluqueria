import { createOAuth2Client } from './services/googleCalendar.js';
import { google } from 'googleapis';

async function checkCalendars() {
  try {
    const oauth2Client = createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list({ showHidden: true });
    
    console.log('\n====================================');
    console.log('📅 DETALLES DE LOS CALENDARIOS ENCONTRADOS 📅');
    calendarList.data.items.forEach(c => {
      console.log(`- Nombre: "${c.summary}"`);
      console.log(`  ID: ${c.id}`);
      console.log(`  Descripción: ${c.description || 'N/A'}`);
      console.log(`  Primario: ${c.primary ? 'Sí' : 'No'}`);
      console.log(`  AccessRole: ${c.accessRole}`);
      console.log('------------------------------------');
    });
    console.log('====================================\n');
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkCalendars();
