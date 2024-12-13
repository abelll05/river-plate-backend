const nodemailer = require('nodemailer');

// Crear el transportador con nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia según tu proveedor de correo
  auth: {
    user: process.env.SMTP_USER, // Email definido en las variables de entorno
    pass: process.env.SMTP_PASSWORD, // Contraseña o contraseña de aplicación
  },
});

// Función para enviar correos
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Dirección del remitente
    to, // Dirección del destinatario
    subject, // Asunto del correo
    text, // Texto plano (opcional)
    html, // Cuerpo en HTML
  };

  try {
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

// Exportar la función para usarla en otros archivos
module.exports = { sendEmail };
