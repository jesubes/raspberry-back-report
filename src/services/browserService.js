// =======================================================================================
//                                  SERVICIO DEL NAVEGADOR (PUPPETEER)
// =======================================================================================
// Este servicio gestiona una única instancia global del navegador Puppeteer.
// El objetivo es evitar el alto costo de rendimiento de lanzar un nuevo navegador
// por cada solicitud que necesite generar una imagen o PDF.

const puppeteer = require('puppeteer');

// Variable global que mantendrá la instancia del navegador una vez inicializada.
let browser;

// Opciones de configuración para el lanzamiento de Puppeteer.
const puppeteerOptions = {
    headless: true, // Ejecutar en modo headless (sin interfaz gráfica).
    args: [
        '--no-sandbox', // Requerido para ejecutar como root en entornos Docker/Linux.
        '--disable-setuid-sandbox', // Medida de seguridad adicional.
        '--disable-dev-shm-usage', // Evita problemas de memoria compartida en ciertos entornos.
    ],
    // executablePath: '/usr/bin/chromium' // Descomentar si se ejecuta en una Raspberry Pi o Linux.
};

/**
 * Inicializa la instancia única del navegador Puppeteer.
 * Si la instancia ya existe, no hace nada.
 * Si falla la inicialización, termina el proceso de la aplicación, ya que es un servicio crítico.
 */
const initBrowser = async () => {
    // Si la variable 'browser' ya tiene una instancia, salimos para no crear una nueva.
    if (browser) return;
    
    try {
        console.log('Iniciando instancia única de Puppeteer...');
        // Lanzamos Puppeteer con las opciones definidas y asignamos la instancia a nuestra variable global.
        browser = await puppeteer.launch(puppeteerOptions);
        console.log('Instancia de Puppeteer iniciada con éxito.');
    } catch (error) {
        console.error('Error fatal al iniciar Puppeteer:', error);
        // Si Puppeteer no puede iniciar, es un error crítico que impide una funcionalidad clave (generar imágenes).
        // Por lo tanto, terminamos la aplicación con un código de error.
        process.exit(1);
    }
};

/**
 * Devuelve la instancia del navegador previamente inicializada.
 * @returns {puppeteer.Browser} La instancia del navegador.
 * @throws {Error} Si se intenta obtener el navegador antes de que haya sido inicializado.
 */
const getBrowser = () => {
    if (!browser) {
        throw new Error('La instancia del navegador no ha sido inicializada. Llama a initBrowser() primero.');
    }
    return browser;
};

// Exportamos las funciones para ser utilizadas en otras partes de la aplicación.
module.exports = {
    initBrowser,
    getBrowser
};