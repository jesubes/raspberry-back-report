const qrcode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')


let qrCodeImage = null; //fromato base64 

const puppeteerOptions = {
    headles: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        // '--disable-accelerated-2d-canvas',
        // '--no-first-run',
        // '--no-zygote',
        // '--single-process', // Importante para evitar múltiples procesos en contenedores Docker
        // '--disable-gpu'
    ],
    executablePath: '/usr/bin/chromium-browser' //ruta del binario de Chromium
    
}

//validar la peticion
const client = new Client({
    puppeteer: puppeteerOptions,
    authStrategy: new LocalAuth() //mantener sesion local
})

client.once('ready', () => {
    console.log('Cliente esta listo');

})

client.on('auth_failure', (msg) => {
    console.error('Error en la autenticación', msg);


})


client.on('reconnecting', () => {
    console.log('Intentando reconectar con WhatsApp Web...');

})

//generar el codigo
client.on('qr', async (qr) => {

    //dar el codigo al frontend
    qrCodeImage = await qrcode.toDataURL(qr);
    console.log('Código listo para el Frontend...');

})


//inicializar
client.initialize().catch(error => {
    console.error('Error al inicializar el cliente de WhatsApp:', error)
});

//generar un mensaje test
const testMessage =  async (req, res) => {

    const number = '5493816450030'; // Número de teléfono con código de país, sin signos de '+'
    const message = 'Este es el BOT DE JESUS de Web'
    const chatId = `${number}@c.us`; // '@c.us' es el identificador de usuarios en WhatsApp Web

    try {
        const response = await client.sendMessage(chatId, message)
        console.log('Mensaje enviado: -> ', response.body);

        res.send(`Mensaje enviado: ${response.body}`)

    } catch (error) {
        console.error('Error al enviar mensaje', error);
    }

}


//Generar el QR
const qrGenerate = (req, res) => {
    if (qrCodeImage) {
        res.send(`<img src="${qrCodeImage}" alt="Código QR de WhapsApp">`)
    } else {
        res.send('<h2>El código QR aún no está disponible, por favor espera...</h2>')
    }
}


module.exports = {
    qrGenerate,
    testMessage,
    client
}