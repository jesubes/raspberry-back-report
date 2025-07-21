// =======================================================================================
//                                  CONTROLADOR DE REPORTES
// =======================================================================================
// Este controlador es el núcleo de la funcionalidad de la aplicación. Orquesta la
// generación de una imagen a partir de datos JSON y su posterior envío a través de WhatsApp.

// Importamos la clase MessageMedia para poder adjuntar archivos (la imagen) al mensaje de WhatsApp.
const { MessageMedia } = require("whatsapp-web.js");
// Importamos nuestra utilidad para convertir un objeto JSON en una imagen.
const { jsonToImage } = require("../utils/toImage.js");
// Importamos la función para obtener un cliente de WhatsApp listo desde nuestro servicio.
const { getFirstReadyClient } = require('../services/whatsappService');
// Importamos la clase ApiError para lanzar errores personalizados.
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Genera un reporte en imagen y lo envía por WhatsApp a un número específico.
 * @param {object} req - El objeto de solicitud de Express. Espera `number` y `name` en los query params,
 *                       y los datos del reporte en formato JSON en el body.
 * @param {object} res - El objeto de respuesta de Express.
 */
const reportForMsg = async (req, res) => {
    // Extraemos el número de teléfono y el nombre del destinatario de los query parameters de la URL.
    const { number, name } = req.query;
    // Extraemos los datos del reporte (un array de objetos) del cuerpo de la solicitud.
    const jsonData = req.body;

    // --- Obtención del Cliente de WhatsApp ---
    // Solicitamos a nuestro servicio el primer cliente que esté listo para operar.
    const client = getFirstReadyClient();
    if (!client) {
        // Si no hay cliente listo, lanzamos un ApiError 503 (Servicio No Disponible).
        throw new ApiError(503, 'El servicio de WhatsApp no está listo. Por favor, intente de nuevo en unos momentos.');
    }

    try {
        // --- Flujo Principal de Operaciones ---

        // 1. Generación de la Imagen: Llamamos a nuestra utilidad para convertir el JSON en una imagen JPG.
        // El `await` asegura que no continuamos hasta que la imagen haya sido creada y guardada en disco.
        const imageGenerated = await jsonToImage(jsonData, number);
        if (!imageGenerated) {
            // Si la generación de la imagen falla, no podemos continuar.
            throw new ApiError(500, 'La generación de la imagen del reporte falló.');
        }
        
        // 2. Preparación para el Envío:
        // Añadimos el prefijo de país al número para formar el ID de WhatsApp.
        const prefixNumber = `549${number}`;
        // Creamos un objeto MessageMedia a partir de la imagen que acabamos de guardar.
        // Esto es lo que la librería necesita para procesar y enviar un archivo adjunto.
        const mediaWs = MessageMedia.fromFilePath(`./reportImage/materiales${number}.jpg`);
        
        // 3. Verificación y Envío del Mensaje:
        // Verificamos que el número de destino sea un contacto válido de WhatsApp.
        const contactId = await client.getNumberId(prefixNumber);
        if (contactId) {
            // Si el contacto es válido, procedemos a enviar los mensajes.
            // Primero, un mensaje de texto introductorio.
            await client.sendMessage(contactId._serialized, `Hola ${name}, \nTe envío el stock de tu almacén:`);
            // Hacemos una pequeña pausa para asegurar que los mensajes lleguen en el orden correcto.
            await new Promise(resolve => setTimeout(resolve, 500));
            // Finalmente, enviamos el mensaje con la imagen adjunta.
            const response = await client.sendMessage(contactId._serialized, mediaWs);

            console.log(`Mensaje de reporte enviado a ${name} (${prefixNumber}). Estado: ${response.fromMe}`);
            return res.send({ messageSent: response.fromMe });
        } else {
            // Si el número no es un contacto válido, lanzamos un ApiError 404.
            throw new ApiError(404, `El número ${number} no es un contacto de WhatsApp válido.`);
        }

    } catch(error) {
        // Si el error ya es un ApiError, lo relanzamos.
        // Si es otro tipo de error, lo convertimos en un ApiError 500.
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al procesar y enviar el reporte.');
    }
};

// Exportamos la función del controlador.
module.exports = {
    reportForMsg
};