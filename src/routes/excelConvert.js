// path excel -->      '/api/excel',

const {Router} = require ('express')
const multer = require('multer');
const { excelExtract, excelToJson } = require('../controller/excelConvertController');

const router = Router();

const upload = multer({ storage: multer.memoryStorage() })

router.post('/', upload.single('fileExcel'), excelExtract) //devolver un html

router.post('/json', upload.single('fileExcel'), excelToJson)  //devolver un json

module.exports = router;