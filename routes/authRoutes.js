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
    const verificationUrl = ` https://river-plate-backend.onrender.com/auth/verify/${newUser.verificationToken}`;
    console.log('URL de verificación generada:', verificationUrl); // Log de la URL generada
    const subject = 'Verifica tu cuenta de River Plate';
    const text = `Hola ${newUser.username},\n\nPara verificar tu cuenta, haz clic en el siguiente enlace: \n\n${verificationUrl}`;

    // Aquí el cuerpo en HTML
    const html = `
      <p>Hola ${newUser.username},</p>
      <p>Para verificar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="color: #1E90FF;">Verifica tu cuenta</a>
    `;

    await sendMail(email, subject, text, html); // Asumiendo que sendMail también maneja el HTML
    console.log('Correo de verificación enviado a:', email); // Log del correo enviado

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
  console.log('Token recibido en el backend:', token); // Confirmar que el token llegó

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      console.log('Token inválido o expirado'); // Log en caso de error
      return res.status(400).json({ error: 'Token de verificación inválido o expirado' });
    }

    // Marcar como verificado y limpiar el token
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    console.log(`Usuario ${user.email} verificado con éxito`); // Confirmar que el usuario fue verificado
    res.status(200).json({ message: 'Cuenta verificada con éxito' });
  } catch (error) {
    console.error('Error en /verify:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
