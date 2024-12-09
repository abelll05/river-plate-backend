const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const sendMail = require('../utils/mailer'); // Asegúrate de tener esta función bien definida
const router = express.Router();

// Middleware de autenticación para proteger las rutas
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

// Ruta para el registro de usuario (con envío de correo)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el correo ya está registrado
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Verificar si el nombre de usuario ya está registrado
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generar un token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar correo de confirmación
    const subject = 'Confirmación de Registro';
    const text = `Hola ${username}, gracias por registrarte en nuestra plataforma.`;
    await sendMail(email, subject, text);

    res.status(201).json({ message: 'Usuario registrado exitosamente y correo enviado', token });
  } catch (error) {
    console.error('Error en /register:', error.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para obtener el perfil del usuario
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Ruta para actualizar el perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Ruta para eliminar la cuenta del usuario
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ message: 'Cuenta eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

module.exports = router;
