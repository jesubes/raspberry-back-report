// =======================================================================================
//                                  SERVICIO DE WHATSAPP
// =======================================================================================
// Este servicio centraliza toda la lógica para interactuar con la librería whatsapp-web.js.
// Su responsabilidad es iniciar, gestionar y proporcionar acceso a los clientes de WhatsApp.

// Importamos los componentes necesarios de la librería de WhatsApp.
const { Client, LocalAuth } = require('whatsapp-web.js');
// Importamos qrcode para poder convertir el string del QR a un formato de imagen (DataURL).
const qrcode = require('qrcode');

// Opciones de configuración para Puppeteer, el navegador headless que usa whatsapp-web.js.
const puppeteerOptions = {
    headless: true, // Ejecutar en modo headless (sin interfaz gráfica).
    args: [
        '--no-sandbox', // Requerido para ejecutar como root en entornos Docker/Linux.
        '--disable-setuid-sandbox', // Medida de seguridad adicional.
        '--disable-dev-shm-usage', // Evita problemas de memoria compartida en ciertos entornos.
    ],
    // executablePath: '/usr/bin/chromium', // Descomentar si se ejecuta en una Raspberry Pi o Linux.
};

// Objeto que almacenará todas las instancias de clientes de WhatsApp, usando el userId como clave.
// Esto permite a la aplicación manejar múltiples sesiones de WhatsApp simultáneamente.
const clients = {};

// Variable para almacenar la instancia de Socket.IO. Se inicializará desde server.js.
let ioInstance;

/**
 * Inicializa la instancia de Socket.IO en el servicio de WhatsApp.
 * @param {object} io - La instancia del servidor de Socket.IO.
 */
const initSocketIO = (io) => {
    ioInstance = io;
    console.log('Socket.IO inicializado en whatsappService.');
};

/**
 * Inicia un nuevo cliente de WhatsApp para un usuario específico.
 * @param {string} userId - El identificador único para la sesión del cliente (ej. 'jesus').
 */
const startClient = (userId) => {
    console.log(`Iniciando cliente de WhatsApp para el usuario: ${userId}`);
    
    // Creamos una nueva instancia del cliente con las opciones de Puppeteer y la estrategia de autenticación.
    const client = new Client({
        puppeteer: puppeteerOptions,
        // LocalAuth permite que la sesión se guarde localmente, evitando tener que escanear el QR en cada reinicio.
        authStrategy: new LocalAuth({
            clientId: userId // El clientId asegura que las sesiones de diferentes usuarios se guarden por separado.
        })
    });

    // Añadimos una propiedad personalizada para rastrear si el cliente está listo para usar.
    client.isReady = false;

    // --- MANEJO DE EVENTOS DEL CLIENTE ---

    // Evento 'qr': Se dispara cuando se genera un nuevo código QR para la autenticación.
    client.on('qr', async (qr) => {
        console.log(`QR generado para ${userId}. Es necesario escanearlo.`);
        // Guardamos el string del QR en el objeto del cliente para poder solicitarlo después.
        client.qrCode = qr;
        // Emitimos el QR a través de Socket.IO a la sala del usuario.
        if (ioInstance) {
            const qrDataUrl = await qrcode.toDataURL(qr);
            ioInstance.to(userId).emit('qr_code', { userId, qrCode: qrDataUrl });
            console.log(`Emitido 'qr_code' para ${userId}`);
        }
    });

    // Evento 'ready': Se dispara una vez que el cliente se ha autenticado y está listo para recibir y enviar mensajes.
    client.once('ready', () => {
        console.log(`¡Cliente de WhatsApp para ${userId} está listo!`);
        // Marcamos nuestro estado personalizado como listo.
        client.isReady = true;
        // Emitimos el estado 'ready' a través de Socket.IO a la sala del usuario.
        if (ioInstance) {
            ioInstance.to(userId).emit('session_status', { userId, status: 'ready' });
            console.log(`Emitido 'session_status: ready' para ${userId}`);
        }
    });

    // Evento 'disconnected': Se dispara si la sesión se desconecta.
    client.on('disconnected', (reason) => {
        console.log(`Cliente ${userId} desconectado. Razón: ${reason}`);
        // Reseteamos el estado y eliminamos al cliente para forzar una nueva inicialización si es necesario.
        client.isReady = false;
        delete clients[userId];
        // Emitimos el estado 'disconnected' a través de Socket.IO a la sala del usuario.
        if (ioInstance) {
            ioInstance.to(userId).emit('session_status', { userId, status: 'disconnected', reason });
            console.log(`Emitido 'session_status: disconnected' para ${userId}`);
        }
    });

    // Evento 'auth_failure': Se dispara si la autenticación falla.
    client.on('auth_failure', (msg) => {
        console.error(`Error de autenticación para ${userId}: ${msg}`);
        client.isReady = false;
        // Emitimos el estado 'auth_failure' a través de Socket.IO a la sala del usuario.
        if (ioInstance) {
            ioInstance.to(userId).emit('session_status', { userId, status: 'auth_failure', message: msg });
            console.log(`Emitido 'session_status: auth_failure' para ${userId}`);
        }
    });

    // Iniciamos el proceso de conexión del cliente.
    client.initialize().catch(error => {
        console.error(`Error al inicializar el cliente ${userId}:`, error);
        // Emitimos un error de inicialización a través de Socket.IO a la sala del usuario.
        if (ioInstance) {
            ioInstance.to(userId).emit('session_status', { userId, status: 'error', message: error.message });
            console.log(`Emitido 'session_status: error' para ${userId}`);
        }
    });

    // Almacenamos la instancia del cliente en nuestro objeto de gestión.
    clients[userId] = client;
};

/**
 * Devuelve la instancia del cliente para un userId específico.
 * @param {string} userId - El identificador del cliente a obtener.
 * @returns {Client|undefined} La instancia del cliente o undefined si no se encuentra.
 */
const getClient = (userId) => {
    return clients[userId];
};

/**
 * Obtiene el código QR (si existe) para un cliente y lo convierte a formato DataURL.
 * @param {string} userId - El identificador del cliente.
 * @returns {Promise<string|null>} Una promesa que resuelve a la imagen del QR en formato DataURL o null.
 */
const getQrCode = async (userId) => {
    const client = clients[userId];
    // Verificamos que el cliente exista y que tenga un código QR generado.
    if (client && client.qrCode) {
        // Convertimos el string del QR a una imagen DataURL que se puede usar en una etiqueta <img>.
        return await qrcode.toDataURL(client.qrCode);
    }
    return null;
};

/**
 * Busca y devuelve el primer cliente de WhatsApp que esté completamente listo para operar.
 * @returns {Client|undefined} La primera instancia de cliente lista, o undefined si no hay ninguna.
 */
const getFirstReadyClient = () => {
    // Usamos Object.values para obtener un array de todas las instancias de cliente
    // y .find() para devolver la primera que cumpla la condición de estar lista.
    return Object.values(clients).find(c => c.isReady);
}

// Exportamos las funciones públicas del servicio para que puedan ser utilizadas por los controladores.
module.exports = {
    initSocketIO, // Exportamos la nueva función de inicialización de Socket.IO
    startClient,
    getClient,
    getQrCode,
    getFirstReadyClient
};
