import { createOAuth2Client } from './services/googleCalendar.js';
import { google } from 'googleapis';

async function checkCalendars() {
  try {
    const oauth2Client = createOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    console.log("Calendarios:", calendarList.data.items.map(c => c.summary).join(', '));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkCalendars();
