// path contact: -->    '/api/contact',

const {Router} = require('express')
const multer = require('multer')
const {excelToJsonContact} = require('../controller/excelConvertController.js') //todo: Ingresar el archivo 


const router = Router();

//middleware
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('fileContact'), excelToJsonContact) //todo: ingresar funcion de convertir excel a json de contactos


module.exports = router;