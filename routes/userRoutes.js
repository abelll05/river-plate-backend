const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate de que el modelo está correctamente definido
const router = express.Router();

// Middleware para verificar token
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

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// Actualizar datos del usuario
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

// Eliminar cuenta del usuario
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
