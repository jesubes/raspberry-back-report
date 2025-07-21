// Importamos las funciones necesarias de nuestro servicio centralizado de WhatsApp.
const { startClient, getQrCode, getFirstReadyClient } = require('../services/whatsappService');
// Importamos la configuración centralizada.
const config = require('../config');
// Importamos la clase ApiError para lanzar errores personalizados.
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Inicia una nueva sesión de cliente de WhatsApp.
 * @param {object} req - El objeto de solicitud de Express. Espera un 'id' de usuario en los parámetros de la ruta.
 * @param {object} res - El objeto de respuesta de Express.
 */
const startWhatsappForClient = (req, res) => {
    // Extraemos el identificador del usuario de los parámetros de la URL (ej. /api/qrcode/start/jesus).
    const userId = req.params.id;
    // Llamamos a la función del servicio para que comience el proceso de inicialización para este usuario.
    startClient(userId);
    // Respondemos inmediatamente al frontend para no dejar la petición colgada.
    // El frontend deberá luego sondear (poll) la ruta de obtener QR.
    res.send({ message: `Iniciando proceso para el usuario: ${userId}. Por favor, solicita el QR en breve.` });
};

/**
 * Obtiene el código QR para un usuario específico si está disponible.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const qrGenerate = async (req, res) => {
    const userId = req.params.id;
    try {
        // Solicitamos el código QR (en formato DataURL) a nuestro servicio.
        const qrCodeImage = await getQrCode(userId);
        
        // Si el servicio devuelve una imagen de QR, la enviamos al frontend.
        if (qrCodeImage) {
            // Enviamos una etiqueta <img> para que el navegador pueda renderizarla fácilmente.
            res.send(`<img src="${qrCodeImage}" alt="Escanea este código QR con WhatsApp">`);
        } else {
            // Si no hay QR, puede ser porque el cliente ya está listo o aún no se ha generado.
            throw new ApiError(404, 'Código QR no disponible. El cliente puede estar ya conectado o aún inicializándose.');
        }
    } catch (error) {
        // Si el error ya es un ApiError, lo relanzamos para que lo capture el middleware.
        // Si es otro tipo de error, lo convertimos en un ApiError 500.
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al obtener el código QR.');
    }
};

/**
 * Envía un mensaje de prueba para verificar que la sesión de WhatsApp funciona correctamente.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const testMessage = async (req, res) => {
    // Obtenemos el número de teléfono para la prueba desde nuestro archivo de configuración.
    const number = config.testPhoneNumber;
    const message = 'Este es un mensaje de prueba automático desde la API.';

    try {
        // Obtenemos el primer cliente que esté completamente listo para operar.
        const client = getFirstReadyClient();
        if (!client) {
            // Si no hay ningún cliente listo, lanzamos un ApiError 503.
            throw new ApiError(503, 'El servicio de WhatsApp no está listo. Por favor, intente de nuevo en unos momentos.');
        }

        // Verificamos si el número de prueba es un contacto válido de WhatsApp.
        const contactId = await client.getNumberId(number);
        if (contactId) {
            // Si es válido, enviamos el mensaje usando su ID serializado.
            const response = await client.sendMessage(contactId._serialized, message);
            console.log('Mensaje de prueba enviado: -> ', response.body);
            return res.send(`Mensaje de prueba enviado con éxito a ${number}.`);
        }
        
        // Si el número no es un contacto válido, lanzamos un ApiError 404.
        throw new ApiError(404, `El número ${number} no es un contacto de WhatsApp válido.`);

    } catch (error) {
        // Si el error ya es un ApiError, lo relanzamos.
        // Si es otro tipo de error, lo convertimos en un ApiError 500.
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al enviar el mensaje de prueba.');
    }
};

// Exportamos las funciones del controlador.
module.exports = {
    startWhatsappForClient,
    qrGenerate,
    testMessage
}; 