const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendMail = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Crear nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verified: false, // Estado de verificación
    });

    // Guardar el usuario en la base de datos
    const savedUser = await newUser.save();

    // Crear un token de verificación (usando JWT)
    const verificationToken = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET, // Asegúrate de definir esta variable en tu .env
      { expiresIn: '1h' } // El token expirará en una hora
    );

    // URL para la verificación
    const verificationUrl = `http://localhost:5000/api/verify/${verificationToken}`;

    // Asunto y cuerpo del correo de confirmación
    const emailSubject = 'Confirmación de Registro - River Plate';
    const emailText = `
      <h1>¡Hola, ${username}!</h1>
      <p>Gracias por registrarte en nuestra plataforma River Plate.</p>
      <p>Para completar tu registro, por favor haz clic en el siguiente enlace para verificar tu correo:</p>
      <p><a href="${verificationUrl}">Verificar correo</a></p>
      <p>Una vez verificado tu correo, podrás iniciar sesión en nuestra plataforma.</p>
      <hr>
      <p>River Plate © 2024. Todos los derechos reservados.</p>
    `;

    // Enviar el correo con el enlace de verificación
    await sendMail(email, emailSubject, emailText);

    // Responder con un mensaje de éxito
    res.status(200).json({ message: 'Usuario registrado correctamente. Se ha enviado un correo de confirmación.' });
  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    res.status(500).json({ error: 'Hubo un problema al registrar al usuario.' });
  }
});

// Ruta de verificación de correo
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Marcar como verificado
    user.verified = true;
    user.verificationToken = undefined; // Limpiar el token de verificación
    await user.save();

    // Redirigir al login
    res.redirect('http://localhost:3000/login'); // URL de tu frontend
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    res.status(400).json({ error: 'Token de verificación inválido o expirado' });
  }
});

module.exports = router;
