const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si ya existe un usuario con el mismo correo
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    // Verificar si ya existe un usuario con el mismo username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generar un token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar el token como respuesta
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error en /register:', error.message);

    // Manejar errores específicos de MongoDB, como duplicados
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern)[0];
      const errorMessage =
        duplicatedField === 'email'
          ? 'El correo ya está registrado.'
          : 'El nombre de usuario ya está registrado.';
      return res.status(400).json({ error: errorMessage });
    }

    res.status(500).json({ error: 'Error en el servidor, por favor intente más tarde.' });
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validación de campos obligatorios
  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en /login:', error.message);
    res.status(500).json({ error: 'Error en el servidor, por favor intente más tarde.' });
  }
});

module.exports = router;
