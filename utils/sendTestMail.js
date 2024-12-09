require('dotenv').config({ path: '../.env' }); // Carga las variables de entorno
const sendMail = require('../utils/mailer'); // Ajusta la ruta si es necesario

// Mostrar credenciales cargadas (para diagnóstico)
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD);

// Función para enviar un correo de prueba
const testEmail = async () => {
  try {
    const to = 'pfinal723@gmail.com'; // Cambia por un correo válido
    const subject = 'Prueba de envío de correo';
    const text = 'Este es un correo de prueba enviado desde tu aplicación.';

    // Enviar el correo
    await sendMail(to, subject, text);
    console.log(`Correo de prueba enviado con éxito a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
  }
};

// Ejecutar la función de prueba
testEmail();
