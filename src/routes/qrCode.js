// ----> /api/qrcode

const { Router } = require('express')
const {startWhatsappForClient,qrGenerate } = require('../controller/qrCodeController')

const router = Router();


router.get('/gen/:id', qrGenerate)
router.get('/start/:id', startWhatsappForClient)


module.exports = router