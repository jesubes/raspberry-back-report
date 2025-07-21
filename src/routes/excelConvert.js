// =======================================================================================
//                                  DEFINICIÓN DE RUTA: CONVERSIÓN DE EXCEL
// =======================================================================================
// Este archivo define las rutas para el endpoint /api/excel.

const { Router } = require('express');
const multer = require('multer');
// Importamos las funciones del controlador que se encargarán de la lógica de conversión.
const { excelExtract, excelToJson } = require('../controller/excelConvertController');
// Importamos el middleware de validación para archivos.
const { validateExcelFile } = require('../middlewares/validators');

const router = Router();

// Configuramos Multer para que guarde los archivos en memoria.
const upload = multer({ storage: multer.memoryStorage() });

// --- DEFINICIÓN DE ENDPOINTS ---

// Endpoint para convertir un Excel a una tabla HTML.
// Se activa con una petición POST a /api/excel.
// La cadena de ejecución es: Multer -> Validación -> Controlador.
router.post('/', upload.single('fileExcel'), validateExcelFile, excelExtract);

// Endpoint para convertir un Excel a un objeto JSON filtrado.
// Se activa con una petición POST a /api/excel/json.
// La cadena de ejecución es: Multer -> Validación -> Controlador.
router.post('/json', upload.single('fileExcel'), validateExcelFile, excelToJson);

// Exportamos el enrutador.
module.exports = router;