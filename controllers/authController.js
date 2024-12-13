const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer'); // Utilidad para enviar el correo
const crypto = require('crypto');

// Registro de usuario
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();

    // Generar un token de verificación
    const verifyToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;

    // Enviar correo de verificación
    await sendEmail(
      user.email,
      'Verifica tu cuenta',
      '',
      `<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p><a href="${verificationLink}">Verificar cuenta</a>`
    );

    res.status(201).json({ message: 'Usuario registrado con éxito. Revisa tu correo para verificar la cuenta.' });
  } catch (err) {
    console.error('Error en register:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    if (!user.isVerified) return res.status(400).json({ message: 'Verifica tu cuenta antes de iniciar sesión.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Enviar correo de restablecimiento de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'El correo no está registrado' });

    // Generar un token para restablecer la contraseña
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // El token vence en 1 hora
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Enviar correo de restablecimiento de contraseña
    await sendEmail(
      user.email,
      'Restablecer tu contraseña',
      '',
      `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">Restablecer contraseña</a>`
    );

    res.json({ message: 'Te hemos enviado un correo para restablecer tu contraseña.' });
  } catch (err) {
    console.error('Error en forgotPassword:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Restablecer la contraseña
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Token de restablecimiento inválido o expirado' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined; // Limpiar el token de restablecimiento
    user.resetTokenExpiry = undefined; // Limpiar la expiración del token
    await user.save();

    res.json({ message: 'Contraseña restablecida con éxito. Ahora puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error en resetPassword:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Verificar la cuenta del usuario
exports.verifyAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    if (user.isVerified) return res.status(400).json({ message: 'La cuenta ya está verificada.' });

    user.isVerified = true; // Marcar al usuario como verificado
    await user.save();

    res.json({ message: 'Cuenta verificada con éxito. Ahora puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error en verifyAccount:', err.message);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};
