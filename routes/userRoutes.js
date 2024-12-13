const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const { verifyToken } = require('../middlewares/authMiddlewares');

// Ruta para obtener los detalles de un usuario (protegida)
router.get('/profile', verifyToken, userControllers.getProfile);

// Ruta para actualizar los datos del usuario (protegida)
router.put('/profile', verifyToken, userControllers.updateProfile);

module.exports = router;
