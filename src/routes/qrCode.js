const { Router } = require('express')
const {qrGenerate } = require('../controller/qrCodeController')

const router = Router();

//importar middlewares

router.get('/', qrGenerate)


module.exports = router