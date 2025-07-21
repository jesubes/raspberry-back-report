// =======================================================================================
//                                  DEFINICIÓN DE RUTA: ENVÍO DE REPORTES
// =======================================================================================
// Este archivo define la ruta principal para la funcionalidad de envío de reportes.

const { Router } = require('express');
// Importamos la función del controlador que orquesta la generación y envío del reporte.
const { reportForMsg } = require('../controller/reportController');
// Importamos nuestro middleware de validación para esta ruta específica.
const { validateReportRequest } = require('../middlewares/validators');

const router = Router();

// --- DEFINICIÓN DE ENDPOINT ---

// Endpoint para generar y enviar un reporte.
// Se activa con una petición POST a /api/report.
// La cadena de middlewares ahora incluye nuestro validador. Si la validación falla,
// la petición no llegará al controlador `reportForMsg`.
router.post('/', validateReportRequest, reportForMsg);

// Exportamos el enrutador.
module.exports = router;