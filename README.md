# Proyecto Backend de River Plate

## Descripción del Proyecto
Este es el backend de la aplicación de gestión de River Plate, desarrollada con Node.js, Express y MongoDB. Proporciona las rutas y la lógica necesaria para autenticar usuarios, gestionar información de la página, y conectarse con la base de datos.

Además, incluye la funcionalidad de registro y login de usuarios con autenticación mediante JWT (JSON Web Tokens) y el envío de correos electrónicos de confirmación al registrarse.

## Librerías Usadas
- `express`: Framework minimalista para Node.js que facilita la creación de servidores.
- `mongoose`: Librería para interactuar con MongoDB a través de modelos y esquemas.
- `cors`: Middleware para permitir solicitudes entre dominios (Cross-Origin Resource Sharing).
- `dotenv`: Permite cargar variables de entorno desde un archivo `.env`.
- `jsonwebtoken`: Para la creación y verificación de tokens JWT en la autenticación de usuarios.
- `bcrypt`: Librería para encriptar contraseñas y mejorar la seguridad de la autenticación.
- `nodemailer`: Librería para enviar correos electrónicos de confirmación a los usuarios tras el registro.