require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para registrar solicitudes entrantes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next(); // Pasa el control al siguiente middleware o ruta
});

// Middlewares globales
app.use(express.json());

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000', // Desarrollo local
  'https://river-plate-frontend.onrender.com', // Dominio del frontend desplegado
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

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

// Uso de rutas
app.use('/api', authRoutes); // Todas las rutas de autenticación usarán el prefijo /api

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
