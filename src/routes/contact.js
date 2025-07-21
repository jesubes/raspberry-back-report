// =======================================================================================
//                                  DEFINICIÓN DE RUTA: CONTACTOS
// =======================================================================================
// Este archivo define las rutas para el endpoint /api/contact.

const { Router } = require('express');
const multer = require('multer');
const { excelToJsonContact } = require('../controller/excelConvertController.js');
// Importamos el middleware de validación para archivos.
const { validateExcelFile } = require('../middlewares/validators');

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// La cadena de ejecución ahora es: Multer -> Validación -> Controlador.
// 1. `upload.single('fileContact')`: Multer procesa el archivo y lo pone en `req.file`.
// 2. `validateExcelFile`: Nuestro validador comprueba que `req.file` exista.
// 3. `excelToJsonContact`: El controlador se ejecuta solo si los pasos anteriores fueron exitosos.
router.post('/', upload.single('fileContact'), validateExcelFile, excelToJsonContact);

module.exports = router;