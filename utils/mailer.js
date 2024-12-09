require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD, 
  },
});

const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER, 
    to, 
    subject, 
    text, 
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito:', info);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    throw new Error('Error al enviar el correo');
  }
};

module.exports = sendMail;
