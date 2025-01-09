const qrcode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')

const puppeteerOptions = {
    headles: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    ],
    // executablePath: '/usr/bin/chromium', //ruta del binario de Chromium  ---> solo en Macbook descactivar


}

const clients = {}

//iniciar usuarios
const startClient = async (userId) => {
    console.log(userId);
    
    let qrCodeImage = null; //fromato base64 
    clients[userId] = new Client({
        puppeteer: puppeteerOptions,
        authStrategy: new LocalAuth({
            clientId: userId
        }) // matener session local de varios usuarios
    })

    //generar el codigo
    clients[userId].on('qr', (qr) => {
        //dar el codigo al frontend
        console.log(`session ${userId} ---->`, qr);

        // qrCodeImage = await qrcode.toDataURL(qr);
        qrCodeImage = qr;
        // console.log('Código listo para el Frontend...');
        clients[userId].qrGen = qr
    })

    //inicializar

    clients[userId].once('ready', () => {
        console.log('Cliente esta listo');
    })

    clients[userId].on('reconnecting', () => {
        console.log('Intentando reconectar con WhatsApp Web...');
    })

    clients[userId].on('auth_failure', (msg) => {
        console.error('Error en la autenticación', msg);
    })

    clients[userId].initialize().catch(error => {
        console.error('Error al inicializar el cliente de WhatsApp:', error)
    });
    
}



//generar un mensaje test
const testMessage = async (req, res) => {
    const number = '5493816450030'; // Número de teléfono con código de país, sin signos de '+'
    const message = 'Este es el BOT DE JESUS que envia automatico'
    const chatId = `${number}@c.us`; // '@c.us' es el identificador de usuarios en WhatsApp Web

    try {
        firstClient = Object.values(clients)[0]
        if (firstClient) {
            const response = await firstClient.sendMessage(chatId, message)
            console.log('Mensaje enviado: -> ', response.body);
            res.send(`Mensaje enviado: ${response.body}`)
        }
        res.status(500).send({ msg: 'No hay Usuario cargado en Whatsapp, No puede enviar msj' })

    } catch (error) {
        console.error('Error al enviar mensaje', error);
    }

}


//Generar el QR
const startWhatsappForClient = (req, res) => {
    userId = req.params.id

    startClient(userId)

    res.send({ userId })
}

//
const qrGenerate = (req, res) => {

    userId = req.params.id

    console.log('qrGenerate -->',clients[userId].qrGen);

    res.send({client: true})
    
}

module.exports = {
    startWhatsappForClient,
    qrGenerate,
    testMessage,
    startClient
} 