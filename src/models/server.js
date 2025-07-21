// =======================================================================================
//                                  IMPORTACIÓN DE MÓDULOS
// =======================================================================================

// Importamos Express, el framework principal para construir nuestra API.
const express = require('express');

// Importamos CORS para permitir que nuestro frontend (que se sirve desde un origen diferente)
// pueda comunicarse con nuestra API sin problemas de seguridad del navegador.
const cors = require('cors');

// Importamos el módulo 'fs' (File System) en su versión basada en promesas.
// Esto nos permite trabajar con el sistema de archivos de forma asíncrona, evitando
// bloquear el hilo principal de Node.js y mejorando el rendimiento.
const fs = require('fs').promises;

// Importamos 'path' para manejar y construir rutas de archivos de manera segura y
// compatible entre diferentes sistemas operativos.
const path = require('path');

// Importamos nuestro objeto de configuración centralizado.
const config = require('../config');

// Importamos el módulo 'http' para crear un servidor HTTP.
const http = require('http');
// Importamos Socket.IO para la comunicación en tiempo real.
const { Server: SocketIOServer } = require('socket.io');
// Importamos el middleware de manejo de errores.
const { errorHandler } = require('../middlewares/errorHandler');

// =======================================================================================
//                                  DEFINICIÓN DE LA CLASE SERVER
// =======================================================================================

// Definimos la clase 'Server', que encapsulará toda la lógica de nuestro servidor.
// Usar una clase nos ayuda a organizar mejor el código, manteniendo propiedades y métodos
// relacionados en un solo lugar.
class Server {

    // El constructor es el primer método que se ejecuta cuando creamos una nueva instancia de Server.
    constructor() {
        // Creamos una instancia de la aplicación Express.
        this.app = express();

        // Creamos un servidor HTTP a partir de nuestra aplicación Express.
        // Esto es necesario para que Socket.IO pueda adjuntarse a él.
        this.server = http.createServer(this.app);

        // Configuramos Socket.IO para que escuche en nuestro servidor HTTP.
        // Permitimos CORS para que el frontend de React pueda conectarse.
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*", // Permitir conexiones desde cualquier origen (ajustar en producción).
                methods: ["GET", "POST"]
            }
        });

        // Leemos el puerto desde nuestro archivo de configuración.
        this.port = config.port;

        // Definimos un objeto para centralizar todas las rutas base de nuestra API.
        // Esto facilita la gestión y modificación de los endpoints en el futuro.
        this.paths = {
            qrcode:   '/api/qrcode',
            report:   '/api/report',
            excel:    '/api/excel',
            contact:  '/api/contact',
            test:     '/api/test'
        };

        // Ruta donde se guardarán las imágenes de los reportes generados.
        this.pathReport = './reportImage';

        // Llamamos a los métodos para configurar los middlewares y las rutas.
        // El orden es importante: los middlewares deben configurarse antes que las rutas.
        this.middlewares();
        this.routes();
        // La configuración de sockets se llamará externamente desde app.js para asegurar la inicialización completa.
    }

    // Método para configurar los middlewares de la aplicación.
    middlewares() {
        // Middleware para parsear automáticamente las solicitudes con cuerpo en formato JSON.
        this.app.use(express.json());

        // Middleware para habilitar CORS, permitiendo las solicitudes desde otros orígenes.
        this.app.use(cors());
    }

    // Método donde se definen y se asignan las rutas de la API.
    routes() {
        // Asignamos cada ruta base a su archivo de rutas correspondiente.
        // Esto mantiene nuestro archivo principal limpio y delega la lógica específica
        // de cada endpoint a su propio módulo.
        this.app.use(this.paths.qrcode, require('../routes/qrCode.js'));
        this.app.use(this.paths.report, require('../routes/reportOut.js'));
        this.app.use(this.paths.excel, require('../routes/excelConvert.js'));
        this.app.use(this.paths.contact, require('../routes/contact.js'));
        this.app.use(this.paths.test, require('../routes/testMsg.js'));

        // El middleware de manejo de errores debe ser el último en la cadena de Express
        // para que pueda capturar los errores de todas las rutas y middlewares anteriores.
        this.app.use(errorHandler);
    }

    // Método para configurar los eventos de Socket.IO.
    sockets() {
        // Importamos la función para inicializar Socket.IO en el servicio de WhatsApp.
        const { initSocketIO } = require('../services/whatsappService');
        // Pasamos la instancia de Socket.IO al servicio de WhatsApp para que pueda emitir eventos.
        initSocketIO(this.io);

        // Cuando un cliente se conecta a nuestro servidor de Socket.IO.
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado a Socket.IO:', socket.id);

            // Puedes añadir más lógica aquí para manejar eventos específicos de Socket.IO
            // Por ejemplo, un evento para que el cliente se una a una sala específica de usuario.
            socket.on('joinUserRoom', (userId) => {
                socket.join(userId);
                console.log(`Cliente ${socket.id} se unió a la sala de usuario: ${userId}`);
            });

            // Manejar la desconexión del cliente.
            socket.on('disconnect', () => {
                console.log('Cliente desconectado de Socket.IO:', socket.id);
            });
        });
    }

    // Método asíncrono para verificar si el directorio de reportes existe y crearlo si no.
    async isPathReport() {
        try {
            // Intentamos acceder al directorio. Si no existe, fs.access lanzará un error.
            await fs.access(this.pathReport);
        } catch (error) {
            // Si el directorio no existe (capturamos el error), lo creamos.
            // Usamos { recursive: true } para que cree cualquier directorio padre necesario.
            console.log(`Directorio de reportes no encontrado. Creando: ${this.pathReport}`);
            await fs.mkdir(this.pathReport, { recursive: true });
        }
    }

    // Método asíncrono y robusto para eliminar una carpeta y todo su contenido.
    async removeSession(folderPath) {
        console.log(`Intentando eliminar la carpeta de sesión: ${folderPath}`);
        try {
            // Verificamos si la carpeta existe. Si no, fs.access lanzará un error.
            await fs.access(folderPath);
            
            // Si existe, la eliminamos con fs.rm.
            // { recursive: true } asegura que se borre todo el contenido interno (evita errores ENOTEMPTY).
            // { force: true } evita que se lance un error si la carpeta ya no existe al momento de borrar.
            await fs.rm(folderPath, { recursive: true, force: true });
            console.log(`La carpeta de sesión ${folderPath} ha sido eliminada con éxito.`);
        } catch (error) {
            // Si el error es 'ENOENT', significa que la carpeta no existía, lo cual no es un problema.
            if (error.code === 'ENOENT') {
                console.log(`La carpeta de sesión ${folderPath} no existe, no se requiere ninguna acción.`);
            } else {
                // Si es otro tipo de error, lo mostramos en consola para diagnóstico.
                console.error(`Error inesperado al eliminar la carpeta de sesión: ${error}`);
            }
        }
    }

    // Método para iniciar el servidor y ponerlo a escuchar en el puerto configurado.
    listen() {
        // En lugar de app.listen, usamos server.listen para que Socket.IO también escuche.
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto --> ', this.port);
        });
    }
}

// Exportamos la clase Server para poder ser utilizada en otros archivos (como app.js).
module.exports = Server;