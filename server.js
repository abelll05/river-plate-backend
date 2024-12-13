require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Registro de solicitudes HTTP

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
  })
  .then(() => {
    console.log('Conexión a MongoDB exitosa');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas de API
app.use('/api', authRoutes);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'build')));

// Manejo de rutas de React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
});

// Middleware de manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error en el servidor' });
});
