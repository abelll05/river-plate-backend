require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Rutas de la API
app.use('/api/auth', authRoutes);

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'build')));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ error: 'Error del servidor' });
});

// Fallback para React
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error al servir index.html:', err);
      res.status(500).send('Error al cargar la aplicación');
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
