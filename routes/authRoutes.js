const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendMail = require('../utils/mailer');
const router = express.Router();
const cors = require('cors');

// Configurar CORS
router.use(cors());

// Ruta de registro de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken: crypto.randomBytes(32).toString('hex'), // Generar un token de verificación
    });

    await newUser.save();

    // Enviar el correo de verificación con enlace HTML
    const verificationUrl = `https://river-plate-frontend.onrender.com/verify/${newUser.verificationToken}`;
    const subject = 'Verifica tu cuenta de River Plate';
    const text = `Hola ${newUser.username},\n\nPara verificar tu cuenta, haz clic en el siguiente enlace: ${verificationUrl}`;

    const html = `
      <p>Hola ${newUser.username},</p>
      <p>Para verificar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="color: #1E90FF;">Verifica tu cuenta</a>
    `;

    await sendMail(email, subject, text, html); // Asumiendo que sendMail también maneja el HTML

    // Responder al frontend
    res.status(201).json({ message: 'Usuario registrado con éxito. Por favor, verifica tu correo.' });
  } catch (error) {
    console.error('Error en el registro:', error.message);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// Ruta de inicio de sesión
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

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en el login:', error.message);
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
    user.verificationToken = null; // Limpiar el token de verificación
    await user.save();

    // Redirigir al frontend para mostrar un mensaje de verificación exitosa
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/verify-success`);
  } catch (error) {
    console.error('Error en /verify:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para enviar enlace de restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar un token único para el restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // El token es válido por 1 hora
    await user.save();

    // Enviar el enlace de restablecimiento por correo electrónico con HTML
    const resetUrl = `https://river-plate-frontend.onrender.com/reset-password/${resetToken}`;
    const subject = 'Restablecer tu contraseña';
    const text = `Hola,\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace: \n\n${resetUrl}`;

    const html = `
      <p>Hola,</p>
      <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
      <a href="${resetUrl}" style="color: #1E90FF;">Restablecer contraseña</a>
    `;

    await sendMail(email, subject, text, html); // Asumiendo que sendMail también maneja el HTML

    res.status(200).json({ message: 'Enlace de restablecimiento de contraseña enviado a tu correo' });
  } catch (error) {
    console.error('Error en /forgot-password:', error.message);
    res.status(500).json({ error: 'Error al enviar el enlace de restablecimiento' });
  }
});

// Ruta para restablecer la contraseña
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'La contraseña es obligatoria' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Verificar que el token no haya expirado
    });

    if (!user) {
      return res.status(400).json({ error: 'Token de restablecimiento inválido o expirado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error en /reset-password:', error.message);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
});

module.exports = router;
