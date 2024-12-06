require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Importante para servir archivos estáticos
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para registrar solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Middleware para analizar el cuerpo de las solicitudes en JSON
app.use(express.json());

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
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Rutas de autenticación
app.use('/api', authRoutes);

// Sirve los archivos estáticos del frontend (React)
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Manejo de rutas del frontend (React)
// Cualquier ruta que no sea API devuelve el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
