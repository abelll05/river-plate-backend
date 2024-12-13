const nodemailer = require("nodemailer");

// Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Cambia según tu proveedor de correo
  port: 587,
  secure: false, // Cambia a true si usas el puerto 465
  auth: {
    user: process.env.SMTP_USER, // Tu correo electrónico
    pass: process.env.SMTP_PASSWORD, // Contraseña o App Password
  },
});

// Verificar conexión
transporter.verify()
  .then(() => console.log("Conexión SMTP exitosa"))
  .catch((error) => console.error("Error con SMTP:", error));

module.exports = transporter;