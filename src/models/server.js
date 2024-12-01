const express = require('express')
const cors = require('cors')
const fs = require('fs')

require('dotenv').config();

class Server{
    constructor() {
        this.app = express();
        
        this.port = process.env.PORT

        this.paths ={
            qrcode:     '/api/qrcode',
            // report:     '/api/report',
            // excel:      '/api/excel',
            // contact:    '/api/contact',
            test:       '/api/test'
        }

        this.pathReport = './reportImage';

        this.middlewares();
        
        this.routes();
    }

    middlewares() {
        this.app.use( express.json() )
        this.app.use(cors())
    }

    routes() {
        this.app.use( this.paths.qrcode, require('../routes/qrCode.js'));
        // this.app.use( this.paths.report, require('../routes/reportOut.js'));
        // this.app.use( this.paths.excel, require('../routes/excelConvert.js'))
        // this.app.use( this.paths.contact, require('../routes/contact.js'))
        // //test 
        this.app.use( this.paths.test, require('../routes/testMsg.js'))
    }

    isPathReport(){
        if(!fs.existsSync(this.pathReport)) {
            fs.mkdirSync(this.pathReport)
        }
    }

    listen() {
        
        this.app.listen( this.port, ()=>{
            console.log('Servidor corriendo en el puerto --> ', this.port)
        })
    }
}

module.exports = Server;