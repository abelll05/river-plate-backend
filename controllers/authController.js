const User = require('../models/User');
const transporter = require('../utils/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');  // Para generar un token de verificación

// Función para enviar correo de confirmación de registro
const enviarCorreoConfirmacion = async (email, nombre, userId) => {
  const verificationToken = crypto.randomBytes(32).toString('hex');  // Generar un token único
  const verificationUrl = `http://localhost:5000/api/verify/${verificationToken}`;  // URL para la verificación

  // Guardar el token de verificación en el usuario (se puede guardar en la base de datos)
  await User.findByIdAndUpdate(userId, {
    verificationToken: verificationToken,
  });

  const mensaje = {
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: 'Confirmación de Registro - River Plate',
    html: `
      <h1>¡Hola, ${nombre}!</h1>
      <p>Gracias por registrarte en nuestra plataforma de River Plate.</p>
      <p>Para completar el proceso de registro, por favor, verifica tu correo haciendo clic en el siguiente enlace:</p>
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
    console.error('Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
};

// Función para verificar el token de verificación
const verificarCorreo = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send('Token de verificación no válido');
    }

    // Actualizar el estado de verificación del usuario
    user.verified = true;
    user.verificationToken = undefined; // Limpiar el token de verificación
    await user.save();

    res.status(200).send('Correo verificado exitosamente. Ahora puedes iniciar sesión.');
  } catch (error) {
    console.error('Error al verificar correo:', error);
    res.status(500).send('Hubo un error al verificar el correo.');
  }
};

module.exports = { 
  enviarCorreoConfirmacion,
  verificarCorreo 
};
