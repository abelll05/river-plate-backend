const transporter = require("../utils/emailService");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Función para enviar el correo de confirmación
const enviarCorreoConfirmacion = async (email, nombre, verificationToken) => {
  // URL de verificación que apunta a tu backend (en producción)
  const verificationUrl = `https://river-plate-backend.onrender.com/api/verify/${verificationToken}`;

  const mensaje = {
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: "Confirmación de Registro - River Plate",
    html: `
      <h1>¡Hola, ${nombre}!</h1>
      <p>Gracias por registrarte en nuestra plataforma River Plate.</p>
      <p>Para completar tu registro, por favor haz clic en el siguiente enlace para verificar tu correo:</p>
      <p><a href="${verificationUrl}">Verificar correo</a></p>
      <p>Una vez verificado tu correo, podrás iniciar sesión en nuestra plataforma.</p>
      <hr>
      <p>River Plate © 2024. Todos los derechos reservados.</p>
    `,
  };

  try {
    await transporter.sendMail(mensaje);
    console.log(`Correo enviado a ${email}`);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo electrónico");
  }
};

// Exportar la función de envío de correo
module.exports = { enviarCorreoConfirmacion };
