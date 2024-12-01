const { Router } = require('express')
const {testMessage } = require('../controller/qrCodeController.js')

const router = Router();

//importar middlewares


router.get('/', testMessage)


module.exports = router