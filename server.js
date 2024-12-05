require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Cambiado de "bcrypt" a "bcrypt"
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para registrar solicitudes entrantes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next(); // Pasa el control al siguiente middleware o ruta
});

// Middlewares
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

  app.use('/api', authRoutes);


// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

// Rutas
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si ya existe el usuario
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generar token JWT automáticamente tras el registro
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario registrado y autenticado con éxito', token });
  } catch (error) {
    console.error('Error en /api/register:', error.message);

    // Manejo de errores específicos de MongoDB
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern)[0];
      const errorMessage =
        duplicatedField === 'email'
          ? 'El correo ya está registrado.'
          : 'El nombre de usuario ya está registrado.';
      return res.status(400).json({ error: errorMessage });
    }

    res.status(500).json({ error: 'Error en el servidor, por favor intente más tarde.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en /api/login:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Acceso permitido', user: req.user });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
