const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailServices');  // Utilidad para enviar el correo
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
    await sendEmail(user.email, 'Verifica tu cuenta', `Haz clic en el siguiente enlace para verificar tu cuenta: ${verificationLink}`);

    res.status(201).json({ message: 'Usuario registrado con éxito. Revisa tu correo para verificar la cuenta.' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
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
    await sendEmail(user.email, 'Restablecer tu contraseña', `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`);

    res.json({ message: 'Te hemos enviado un correo para restablecer tu contraseña.' });
  } catch (err) {
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

    user.isVerified = true; // Marcar al usuario como verificado
    await user.save();

    res.json({ message: 'Cuenta verificada con éxito. Ahora puedes iniciar sesión.' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};
