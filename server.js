require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression'); // Importa el middleware de compresión
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para manejar JSON
app.use(express.json());

// Middleware para compresión HTTP
app.use(compression());

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://river-plate-frontend.onrender.com',
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 45000, // Tiempo máximo para operaciones en el socket
    connectTimeoutMS: 10000, // Tiempo máximo para conectar
  })
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas de autenticación
app.use('/api', authRoutes);

// Servir archivos estáticos de la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Manejar todas las rutas no definidas (React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
