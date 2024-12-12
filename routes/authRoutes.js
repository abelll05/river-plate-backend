const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendMail = require('../utils/mailer');  // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para registro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo ya está registrado.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    // Enviar correo de confirmación
    const mailSubject = 'Confirmación de Registro';
    const mailText = `Hola ${username}, gracias por registrarte en nuestra plataforma riverplatense.`;
    await sendMail(email, mailSubject, mailText);  // Enviar el correo con el nombre dinámico

    res.status(201).json({ message: 'Usuario registrado con éxito. Te hemos enviado un correo de confirmación.' });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Hubo un problema al registrar al usuario.' });
  }
});

module.exports = router;
