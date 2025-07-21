// Importamos la clase Server, que encapsula nuestro servidor Express.
const Server = require('./src/models/server');
// Importamos la función para inicializar el navegador Puppeteer desde nuestro servicio dedicado.
const { initBrowser } = require('./src/services/browserService');

/**
 * Función principal asíncrona para iniciar la aplicación.
 * Usamos una función async para poder utilizar 'await' y asegurarnos de que los servicios
 * críticos (como el navegador) se inicien antes de que el servidor empiece a aceptar peticiones.
 */
const startServer = async () => {
    // Primero, esperamos a que la instancia única del navegador Puppeteer se inicie y esté lista.
    // Esto es crucial porque la generación de imágenes depende de este servicio.
    await initBrowser();

    // Una vez que los servicios dependientes están listos, creamos una instancia de nuestro servidor.
    const server = new Server();
    
    // Verificamos y creamos el directorio para los reportes si no existe.
    server.isPathReport();
    
    // Iniciamos el servidor para que empiece a escuchar peticiones en el puerto configurado.
    server.listen();

    // Configuramos los sockets después de que el servidor esté escuchando.
    server.sockets();
};

// Ejecutamos la función principal para arrancar toda la aplicación.
startServer();
