require('dotenv').config({ path: '../.env' }); 
const sendMail = require('../utils/mailer'); 

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD);

const testEmail = async () => {
  try {
    const to = 'pfinal723@gmail.com'; 
    const subject = 'Prueba de envío de correo';
    const text = 'Este es un correo de prueba enviado desde tu aplicación.';

    await sendMail(to, subject, text);
    console.log(`Correo de prueba enviado con éxito a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
  }
};

testEmail();
