// =======================================================================================
//                                  CONTROLADOR DE CONVERSIÓN DE EXCEL
// =======================================================================================
// Este controlador maneja las solicitudes para procesar y convertir archivos de Excel.

// Importamos la librería 'xlsx' para leer y parsear archivos de Excel.
const XLSX = require('xlsx');
// Importamos nuestra función de utilidad para filtrar columnas de un JSON.
const { filterToJSON } = require('../utils/filter.js');
// Importamos nuestro objeto de configuración centralizado.
const config = require('../config');
// Importamos la clase ApiError para lanzar errores personalizados.
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Procesa un archivo Excel subido y devuelve su contenido como una tabla HTML.
 * @param {object} req - El objeto de solicitud de Express, se espera que contenga el archivo en `req.file`.
 * @param {object} res - El objeto de respuesta de Express.
 */
const excelExtract = async (req, res) => {
    try {
        // Validamos que se haya subido un archivo. `req.file` es añadido por Multer.
        if (!req.file) {
            // Si no hay archivo, lanzamos un ApiError que será capturado por el middleware global.
            throw new ApiError(400, 'No se cargó ningún archivo.');
        }

        // Leemos el contenido del archivo Excel desde el buffer de memoria.
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

        // Obtenemos la primera hoja de cálculo del libro de Excel.
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertimos el contenido de la hoja a una tabla HTML básica.
        const htmlData = XLSX.utils.sheet_to_html(worksheet);

        // Creamos un documento HTML completo y le añadimos estilos CSS para que la tabla sea legible.
        const styledHtml = `
             <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                </style>
            </head>
            <body>
                ${htmlData}
            </body>
            </html>        
        `;

        // Enviamos el HTML estilizado como respuesta.
        return res.send(styledHtml);

    } catch (error) {
        // Si el error ya es un ApiError, lo relanzamos para que lo capture el middleware.
        // Si es otro tipo de error, lo convertimos en un ApiError 500.
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al procesar el archivo.');
    }
};

/**
 * Procesa un archivo Excel, lo convierte a JSON y filtra las columnas deseadas.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const excelToJson = async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No se cargó ningún archivo.');
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = workbook.Sheets[sheetName];

        // Convertimos la hoja de cálculo completa a un array de objetos JSON.
        const jsonData = XLSX.utils.sheet_to_json(sheetData);
        
        // Usamos nuestra utilidad para filtrar el JSON, utilizando las columnas definidas en nuestro archivo de configuración.
        const resultDataFilter = await filterToJSON(config.reportColumns, jsonData);

        // Devolvemos el array de objetos JSON filtrado.
        return res.send(resultDataFilter);

    } catch (error) {
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al procesar el archivo.');
    }
};

/**
 * Procesa un archivo Excel de contactos, lo convierte a JSON y lo limpia.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
const excelToJsonContact = async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No se cargó ningún archivo.');
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Filtramos las columnas relevantes para la lista de contactos, usando la configuración central.
        const resultDataFilter = await filterToJSON(config.contactColumns, jsonData);
        
        // Limpiamos la lista, eliminando cualquier fila que no tenga los campos esenciales (Nombre, Numero, Almacén).
        // Esto asegura que no procesemos contactos incompletos.
        const resultNoNull = resultDataFilter.filter(item => {
            return item.Nombre && item.Numero && item.Almacén;
        });

        // Devolvemos la lista de contactos limpia.
        return res.send(resultNoNull);

    } catch (error) {
        throw error instanceof ApiError ? error : new ApiError(500, 'Error interno al procesar el archivo.');
    }
};

// Exportamos las funciones del controlador para ser usadas en los archivos de rutas.
module.exports = {
    excelExtract,
    excelToJson,
    excelToJsonContact
};