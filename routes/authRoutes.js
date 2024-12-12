const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para generar tokens únicos
const User = require('../models/User');
const sendMail = require('../utils/mailer');
const router = express.Router();

// Ruta de registro con verificación de correo
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token único para la verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken, // Guardar token de verificación
    });
    await newUser.save();

    // Usar la variable de entorno FRONTEND_URL para obtener la URL correcta
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Valor por defecto para desarrollo
    const verificationUrl = `${frontendUrl}/verify/${verificationToken}`;

    const subject = 'Verifica tu correo electrónico';
    const text = `
      Hola ${username},
      Gracias por registrarte. Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:
      ${verificationUrl}
    `;
    await sendMail(email, subject, text);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo.',
    });
  } catch (error) {
    console.error('Error en /register:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Por favor verifica tu correo antes de iniciar sesión.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en /login:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para verificar el correo electrónico
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Token de verificación inválido o expirado' });
    }

    // Marcar como verificado y limpiar el token
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // Redirigir a la URL del frontend después de verificar (producción)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Valor por defecto para desarrollo
    res.redirect(`${frontendUrl}/login`); // Redirige a la página de login en producción

  } catch (error) {
    console.error('Error en /verify:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
