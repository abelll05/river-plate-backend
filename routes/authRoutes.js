const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { enviarCorreoConfirmacion } = require('../utils/mailer'); // Importamos correctamente la función
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

    // Enviar el correo con el enlace de verificación
    await enviarCorreoConfirmacion(email, username, verificationToken); // Usamos la función correctamente

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
    await user.save();

    // Redirigir al login en producción
    res.redirect('https://river-plate-frontend.onrender.com/login'); // URL de login en producción
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    res.status(400).json({ error: 'Token de verificación inválido o expirado' });
  }
});

module.exports = router;
