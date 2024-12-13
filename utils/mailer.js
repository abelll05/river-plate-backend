require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración del transportador
const transporter = nodemailer.createTransport({
  service: 'gmail', // Servicio de correo (puedes cambiarlo según tu SMTP)
  auth: {
    user: process.env.SMTP_USER, // Tu correo electrónico
    pass: process.env.SMTP_PASSWORD, // Tu contraseña o contraseña de aplicación
  },
});

// Función para enviar correos
const sendMail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.SMTP_USER, // Remitente
    to, // Destinatario
    subject, // Asunto
    text, // Cuerpo de texto plano
    html, // Cuerpo HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    throw new Error('Error al enviar el correo');
  }
};

module.exports = sendMail;
