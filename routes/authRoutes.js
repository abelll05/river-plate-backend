const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendMail = require('../utils/mailer');
const router = express.Router();

// Ruta para solicitar el enlace de restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar un token único para restablecer la contraseña
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // URL del frontend
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const subject = 'Restablecimiento de contraseña';
    const text = `
      Hola ${user.username},
      Para restablecer tu contraseña, haz clic en el siguiente enlace:
      <a href="${resetUrl}">Restablecer contraseña</a>
    `;
    await sendMail(email, subject, text);

    res.status(200).json({ message: 'Enlace de restablecimiento de contraseña enviado' });
  } catch (error) {
    console.error('Error en /forgot-password:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para restablecer la contraseña
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Verificar si el token no ha expirado
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Actualizar la contraseña del usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null; // Limpiar el token de restablecimiento
    user.resetPasswordExpires = null; // Limpiar la expiración del token
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error en /reset-password:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
