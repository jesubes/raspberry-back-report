const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

require('dotenv').config();

class Server {
    constructor() {
        this.app = express();

        this.port = process.env.PORT

        this.paths = {
            qrcode: '/api/qrcode',
            report: '/api/report',
            excel: '/api/excel',
            contact: '/api/contact',
            test: '/api/test'
        }

        this.pathReport = './reportImage';

        this.middlewares();

        this.routes();
    }

    middlewares() {
        this.app.use(express.json())
        this.app.use(cors())
    }

    routes() {
        this.app.use(this.paths.qrcode, require('../routes/qrCode.js'));
        this.app.use(this.paths.report, require('../routes/reportOut.js'));
        this.app.use(this.paths.excel, require('../routes/excelConvert.js'))
        this.app.use(this.paths.contact, require('../routes/contact.js'))
        this.app.use(this.paths.test, require('../routes/testMsg.js'))
    }

    isPathReport() {
        if (!fs.existsSync(this.pathReport)) {
            fs.mkdirSync(this.pathReport)
        }
    }

    removeSession(folderPath) {
        console.log(folderPath);
        try {            
            // Verifica si la carpeta existe
            if (!fs.existsSync(folderPath)) {
                console.log(`La carpeta ${folderPath} no existe.`);
                return;
            }
            // Lee los archivos y carpetas dentro de la carpeta
            const files = fs.readdirSync(folderPath);
            // Elimina cada archivo/carpeta encontrado
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    // Si es una carpeta, la elimina de forma recursiva
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    // Si es un archivo, lo elimina
                    fs.unlinkSync(filePath);
                }
            });
            console.log(`Todo el contenido de la carpeta ${folderPath} ha sido eliminado.`);
        } catch (error) {
            console.error(`Error al limpiar la carpeta: ${error}`);
        }
    }


    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto --> ', this.port)
        })
    }
}

module.exports = Server;