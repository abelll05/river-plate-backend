const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"River Plate" <${process.env.SMTP_USER}>`, // Remitente
      to, // Destinatario
      subject, // Asunto
      text, // Texto plano
      html, // Cuerpo HTML
    });
    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    throw new Error('No se pudo enviar el correo.');
  }
};

module.exports = sendMail;
