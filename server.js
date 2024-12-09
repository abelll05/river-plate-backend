require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Para poder recibir datos JSON en las peticiones
app.use(cors({ origin: ['http://localhost:3000', 'https://river-plate-frontend.onrender.com'], credentials: true }));

// Conexión a MongoDB (optimización de la conexión)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Añadido para evitar largos tiempos de espera
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch((err) => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1); // Termina el proceso si la conexión falla
});

// Rutas de autenticación
app.use('/api', authRoutes);

// Servir archivos estáticos en producción
app.use(express.static(path.join(__dirname, 'build')));

// Ruta comodín para manejar todas las rutas no encontradas (por ejemplo, en producción)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Escuchar en el puerto configurado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
