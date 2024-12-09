const sendMail = require('../utils/mailer');

// Llama a la función sendMail con el correo de prueba
sendMail('testemail@example.com', 'Prueba de Correo', 'Este es un correo de prueba')
  .then((info) => console.log('Correo enviado:', info))
  .catch((err) => console.error('Error al enviar correo:', err));
