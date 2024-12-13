const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: text,
    });

    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar correo:', error.message);
    throw new Error('No se pudo enviar el correo electrónico.');
  }
};

module.exports = sendMail;
