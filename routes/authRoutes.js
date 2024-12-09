const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscamos al usuario por email
    const user = await User.findOne({ email }).select('email password');
    if (!user) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Puedes ajustar el tiempo de expiración si es necesario
    });

    res.json({ token });
  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrarse:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
