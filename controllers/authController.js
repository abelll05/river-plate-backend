const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require("../utils/emailServices");

// Función para enviar el correo de confirmación
const enviarCorreoConfirmacion = async (email, nombre, token) => {
  const mensaje = {
    from: process.env.SMTP_USER, 
    to: email, 
    subject: "Confirmación de Registro - River Plate",
    html: `
      <h1>¡Hola, ${nombre}!</h1>
      <p>Gracias por registrarte en nuestra plataforma de River Plate.</p>
      <p>Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/verify/${token}">Verificar mi cuenta</a> <!-- Enlace para producción -->
      <p>Disfruta de la experiencia exclusiva como hincha del Millonario.</p>
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

module.exports = { enviarCorreoConfirmacion };
