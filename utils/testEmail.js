const sendMail = require('../utils/mailer');

sendMail('testemail@example.com', 'Prueba de Correo', 'Este es un correo de prueba')
  .then((info) => console.log('Correo enviado:', info))
  .catch((err) => console.error('Error al enviar correo:', err));
