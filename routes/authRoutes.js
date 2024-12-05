const express = require('express');
const bcrypt = require('bcrypt'); // Biblioteca para encriptar contraseñas
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Modelo de usuario
const router = express.Router();

// Ruta de registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si ya existe un usuario con el mismo correo o username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      const duplicatedField = existingUser.email === email ? 'correo' : 'nombre de usuario';
      return res.status(400).json({ error: `El ${duplicatedField} ya está registrado.` });
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

    res.status(201).json({ message: 'Usuario registrado con éxito.', token });
  } catch (error) {
    console.error('Error en /register:', error.message);
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
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    console.error('Error en /login:', error.message);
    res.status(500).json({ error: 'Error en el servidor, por favor intente más tarde.' });
  }
});

// Exportar el router
module.exports = router;
