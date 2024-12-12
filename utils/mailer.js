require('dotenv').config();
const nodemailer = require('nodemailer');

// Crear el transportador con las credenciales de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,  // Tu correo de Gmail
    pass: process.env.SMTP_PASSWORD,  // La contraseña o App Password de Gmail
  },
});

// Función para enviar correos
const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER, // De: tu correo
    to,                         // Para: correo del destinatario
    subject,                    // Asunto del correo
    text,                       // Cuerpo del correo
  };

  // Imprimir los detalles del correo para depuración
  console.log('Enviando correo a:', to);
  console.log('Asunto:', subject);
  console.log('Texto del correo:', text);

  try {
    // Enviar el correo usando nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    throw new Error('Error al enviar el correo');
  }
};

module.exports = sendMail;
