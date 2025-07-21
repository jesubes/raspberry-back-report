// =======================================================================================
//                                  UTILIDAD DE CONVERSIÓN JSON A IMAGEN
// =======================================================================================

const XLSX = require('xlsx');
// Importamos la función para obtener la instancia global del navegador desde nuestro servicio.
const { getBrowser } = require('../services/browserService');

/**
 * Convierte un array de objetos JSON en una imagen JPG que contiene una tabla HTML.
 * @param {object[]} jsonData - El array de objetos a convertir.
 * @param {string} phone - El número de teléfono del destinatario, usado para nombrar el archivo de imagen.
 * @returns {Promise<boolean>} Una promesa que resuelve a `true` si la imagen se creó con éxito, o `false` si falló.
 */
const jsonToImage = async (jsonData, phone) => {

    // Ordenamos los datos alfabéticamente por el campo 'Texto breve de material' para una mejor presentación.
    const sortedJsonData = jsonData.sort((a, b) =>
        a['Texto breve de material'].localeCompare(b['Texto breve de material'])
    );
    
    // Creamos una nueva hoja de cálculo en memoria a partir de nuestros datos JSON ordenados.
    const newWorkSheet = XLSX.utils.json_to_sheet(sortedJsonData);

    // Convertimos la hoja de cálculo a una tabla HTML básica.
    const tableHtml = XLSX.utils.sheet_to_html(newWorkSheet);

    // Envolvemos la tabla en un documento HTML completo con estilos CSS para darle formato.
    const styledHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${tableHtml}
        </body>
        </html>
    `;

    // Obtenemos la instancia única y compartida del navegador desde nuestro servicio.
    const browser = getBrowser();
    // Abrimos una nueva página (pestaña) en el navegador. Es mucho más rápido que lanzar un navegador nuevo.
    const page = await browser.newPage();

    try {
        // Cargamos nuestro HTML con estilos en la página.
        await page.setContent(styledHtml);

        // Ajustamos el tamaño del viewport (la ventana visible) para que la tabla quepa.
        // Esto es importante para que el screenshot capture todo el contenido correctamente.
        const rowHeight = 35; // Altura estimada por fila en píxeles.
        const totalHeight = Math.max(rowHeight * (jsonData.length + 1), 100); // +1 por la cabecera, con un mínimo.

        await page.setViewport({
            width: 900, // Ancho de la imagen.
            height: totalHeight // Alto calculado.
        });

        // Definimos la ruta donde se guardará la imagen del reporte.
        const jpgFilePath = `./reportImage/materiales${phone}.jpg`;

        // Tomamos un screenshot de la página y la guardamos en la ruta especificada.
        await page.screenshot({ path: jpgFilePath, fullPage: true });

        console.log(`Imagen de reporte generada con éxito en: ${jpgFilePath}`);
        return true;

    } catch (error) {
        console.error('Error al convertir el JSON a imagen:', error);
        return false;
    } finally {
        // Bloque `finally`: este código se ejecuta siempre, tanto si hay éxito como si hay un error.
        // Es crucial cerrar la página para liberar sus recursos de memoria.
        await page.close();
        console.log('Página de Puppeteer cerrada.');
    }
};

module.exports = {
    jsonToImage
};