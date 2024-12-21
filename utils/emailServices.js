const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD, 
  },
});

transporter.verify()
  .then(() => console.log("Conexión SMTP exitosa"))
  .catch((error) => console.error("Error con SMTP:", error));

module.exports = transporter;