const transporter = require("../utils/emailService");

const enviarCorreoConfirmacion = async (email, nombre) => {
  const mensaje = {
    from: process.env.EMAIL_USER, 
    to: email, 
    subject: "Confirmación de Registro - River Plate",
    html: `
      <h1>¡Hola, ${nombre}!</h1>
      <p>Gracias por registrarte en nuestra plataforma de River Plate.</p>
      <p>Disfruta de la experiencia exclusiva como hincha del Millonario.</p>
      <p>¡Bienvenido a la familia de River Plate!</p>
      <hr>
      <p>River Plate © 2024. Todos los derechos reservados.</p>
    `,
  };

  try {
    await transporter.sendMail(mensaje);
    console.log(`Correo enviado a ${email}`);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo electrónico");
  }
};

module.exports = { enviarCorreoConfirmacion };
