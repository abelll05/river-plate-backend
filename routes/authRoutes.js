const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un token de verificación
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    await user.save();

    // Enviar correo de verificación
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Usuario registrado. Por favor verifica tu correo.' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Ruta para verificar el correo electrónico
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario con el token de verificación
    const user = await User.findOne({ email: decoded.email, verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Token de verificación inválido o expirado.' });
    }

    // Marcar al usuario como verificado
    user.isVerified = true;
    user.verificationToken = null; // Eliminar el token de verificación
    await user.save();

    // Redirigir a la página de éxito en el frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/verify-success`);
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar al usuario
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Por favor verifica tu correo antes de iniciar sesión.' });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar un token de autenticación
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Ruta para reenvío de correo de verificación (opcional)
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar al usuario
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'El usuario ya está verificado.' });
    }

    // Generar un nuevo token de verificación
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    user.verificationToken = verificationToken;
    await user.save();

    // Enviar correo de verificación
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: 'Correo de verificación reenviado.' });
  } catch (error) {
    console.error('Error al reenviar correo de verificación:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

module.exports = router;
