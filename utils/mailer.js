// Carga las variables de entorno
require('dotenv').config();

const nodemailer = require('nodemailer');

// Crea el transporte de correo utilizando las credenciales del archivo .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Tu correo de Gmail
    pass: process.env.SMTP_PASSWORD, // La contraseña de la aplicación generada en Gmail
  },
});

// Función para enviar correos electrónicos
const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER, // Remitente (tu correo de Gmail)
    to, // Destinatario
    subject, // Asunto del correo
    text, // Contenido del correo
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    throw new Error('Error al enviar el correo');
  }
};

module.exports = sendMail;
