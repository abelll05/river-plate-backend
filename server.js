require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para solicitudes JSON
app.use(express.json());

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000', // Desarrollo local
  'https://river-plate-frontend.onrender.com', // Despliegue en Render del frontend
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
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas de la API (si tienes rutas de autenticación o API, configúralas aquí)
app.use('/api', authRoutes);

// Middleware para servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'build')));

// Esta ruta maneja todas las rutas de React y siempre devuelve index.html
// Esto es necesario para las SPA que usan React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
