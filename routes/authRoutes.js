const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendMail = require('../utils/mailer');

const router = express.Router();

// Ruta de registro de usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(4).toString('hex'); // Generar código de 4 dígitos

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();

    const subject = 'Verifica tu cuenta de River Plate';
    const text = `Hola ${newUser.username},\n\nTu código de verificación es: ${verificationToken}`;
    const html = `<p>Hola ${newUser.username},</p><p>Tu código de verificación es: <strong>${verificationToken}</strong></p>`;

    await sendMail(email, subject, text, html);
    console.log('Correo de verificación enviado a:', email);

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
    console.error('Error en el login:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para verificar el código de verificación
router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'El correo electrónico y el código son obligatorios' });
  }

  try {
    const user = await User.findOne({ email, verificationToken: code });
    if (!user) {
      return res.status(400).json({ error: 'Código de verificación incorrecto o expirado' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    console.log(`Usuario ${user.email} verificado con éxito`);
    res.status(200).json({ message: 'Cuenta verificada con éxito' });
  } catch (error) {
    console.error('Error en la verificación del código:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;