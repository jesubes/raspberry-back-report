// =======================================================================================
//                                  MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// =======================================================================================
// Este archivo define una clase de error personalizada y un middleware global
// para centralizar el manejo de errores en la aplicación.

/**
 * Clase de error personalizada para errores de la API.
 * Permite adjuntar un código de estado HTTP y un mensaje específico para el cliente.
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message); // Llama al constructor de la clase base Error.
        this.statusCode = statusCode; // Código de estado HTTP (ej. 400, 404, 500).
        this.isOperational = true; // Indica que es un error esperado y manejado por la aplicación.
        Error.captureStackTrace(this, this.constructor); // Captura el stack trace para depuración.
    }
}

/**
 * Middleware global para el manejo de errores.
 * Este middleware se coloca al final de todas las definiciones de rutas en Express.
 * Captura cualquier error que se propague a través de la cadena de middlewares y rutas.
 * @param {Error} err - El objeto de error que se ha propagado.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar el control al siguiente middleware (no se usa aquí, ya que es el último).
 */
const errorHandler = (err, req, res, next) => {
    // Determinamos el código de estado y el mensaje de error.
    // Por defecto, un error interno del servidor.
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor.';

    // Si el error no es operacional (ej. un error de programación), lo tratamos como un error 500 genérico
    // para evitar filtrar detalles sensibles al cliente.
    if (!err.isOperational) {
        statusCode = 500;
        message = 'Error interno del servidor.';
    }

    // Registramos el error en la consola del servidor para depuración.
    console.error('Error capturado por el manejador global:', err);

    // Enviamos la respuesta de error al cliente en formato JSON.
    res.status(statusCode).json({
        status: 'error',
        message: message
    });
};

module.exports = {
    ApiError,
    errorHandler
};