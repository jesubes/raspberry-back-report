const { Router } = require('express')
const {testMessage } = require('../controller/qrCodeController.js')

const router = Router();

router.get('/', testMessage)


module.exports = router