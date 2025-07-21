// =======================================================================================
//                                  MIDDLEWARE DE VALIDACIÓN
// =======================================================================================
// Este archivo centraliza todas las reglas de validación de la aplicación usando express-validator.

const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware que procesa los resultados de la validación.
 * Si hay errores, los formatea y los envía en una respuesta 400.
 * Si no hay errores, pasa el control al siguiente middleware (o al controlador).
 */
const handleValidationErrors = (req, res, next) => {
    // Obtenemos los errores de validación de la solicitud actual.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Si hay errores, respondemos con un código 400 (Bad Request) y un JSON
        // que contiene el array de errores para que el frontend pueda procesarlos.
        return res.status(400).json({ errors: errors.array() });
    }
    // Si no hay errores, continuamos con el siguiente middleware en la cadena.
    next();
};

// --- DEFINICIÓN DE CADENAS DE VALIDACIÓN ---

// Reglas para las rutas que manejan la sesión de WhatsApp.
const validateUserId = [
    // Validamos que el parámetro 'id' en la URL no esté vacío y sea un string sin caracteres especiales.
    param('id', 'El ID de usuario es requerido y debe ser simple.').notEmpty().isString().isAlphanumeric(),
    handleValidationErrors // Siempre terminamos con nuestro manejador de errores.
];

// Reglas para la ruta que envía el reporte.
const validateReportRequest = [
    // Validamos que el query param 'number' exista y sea un número de teléfono válido.
    query('number', 'El número de teléfono es requerido.').notEmpty().isMobilePhone('any'),
    // Validamos que el query param 'name' exista y no esté vacío.
    query('name', 'El nombre del destinatario es requerido.').notEmpty().isString(),
    // Validamos que el cuerpo de la solicitud sea un array y que contenga al menos un elemento.
    body('*', 'El cuerpo del reporte debe ser un array de objetos no vacío.').isArray({ min: 1 }),
    handleValidationErrors
];

// Reglas para las rutas que suben archivos de Excel.
const validateExcelFile = [
    // Validamos que el campo 'file' (añadido por Multer) exista.
    // Usamos `custom` para crear una validación a medida.
    body('file').custom((value, { req }) => {
        if (!req.file) {
            // Si `req.file` no existe, lanzamos un error.
            throw new Error('No se ha subido ningún archivo de Excel.');
        }
        // Si todo está bien, devolvemos true.
        return true;
    }),
    handleValidationErrors
];


module.exports = {
    validateUserId,
    validateReportRequest,
    validateExcelFile
};