import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el transporter de nodemailer
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar email al negocio (nueva cita)
export const sendNewAppointmentEmail = async (appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.BUSINESS_EMAIL,
    subject: '🔔 Nueva Solicitud de Cita',
    html: `
      <h2>Nueva Solicitud de Cita</h2>
      <p><strong>Cliente:</strong> ${appointment.clientName}</p>
      <p><strong>Email:</strong> ${appointment.clientEmail}</p>
      <p><strong>Teléfono:</strong> ${appointment.clientPhone}</p>
      <p><strong>Servicio:</strong> ${appointment.service}</p>
      <p><strong>Fecha:</strong> ${appointment.date}</p>
      <p><strong>Hora:</strong> ${appointment.time}</p>
      <p><strong>Notas:</strong> ${appointment.notes || 'Sin notas'}</p>
      <br>
      <p>Por favor, revisa el dashboard para aprobar o rechazar esta cita.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado al negocio');
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

// Función para enviar email a la clienta (cita aprobada)
export const sendApprovedEmail = async (appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: appointment.clientEmail,
    subject: '✅ Cita Confirmada',
    html: `
      <h2>¡Tu cita ha sido confirmada!</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>Tu cita ha sido confirmada con los siguientes detalles:</p>
      <ul>
        <li><strong>Servicio:</strong> ${appointment.service}</li>
        <li><strong>Fecha:</strong> ${appointment.date}</li>
        <li><strong>Hora:</strong> ${appointment.time}</li>
      </ul>
      <p>¡Nos vemos pronto!</p>
      <br>
      <p>Si necesitas cancelar o modificar tu cita, por favor contacta con nosotros.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de confirmación enviado al cliente');
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

// Función para enviar email a la clienta (cita rechazada)
export const sendRejectedEmail = async (appointment, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: appointment.clientEmail,
    subject: '❌ Cita No Disponible',
    html: `
      <h2>Tu solicitud de cita</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>Lamentablemente no podemos confirmar tu cita para el ${appointment.date} a las ${appointment.time}.</p>
      ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
      <p>Por favor, contacta con nosotros para buscar otra fecha disponible.</p>
      <br>
      <p>¡Gracias por tu comprensión!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de rechazo enviado al cliente');
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};
