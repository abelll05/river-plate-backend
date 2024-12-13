const express = require('express');
const router = express.Router();
const { register, login, verifyAccount, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta para registrar un usuario
router.post('/register', authControllers.register);

// Ruta para iniciar sesión
router.post('/login', authControllers.login);

// Ruta para enviar el correo de restablecimiento de contraseña
router.post('/forgot-password', authControllers.forgotPassword);

// Ruta para restablecer la contraseña usando un token
router.post('/reset-password/:token', authControllers.resetPassword);

// Ruta para verificar la cuenta (cuando el usuario hace clic en el enlace de verificación)
router.get('/verify/:token', authControllers.verifyAccount);

module.exports = router;
