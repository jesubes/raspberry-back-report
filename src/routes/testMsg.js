// =======================================================================================
//                                  DEFINICIÓN DE RUTA: MENSAJE DE PRUEBA
// =======================================================================================
// Este archivo define una ruta de utilidad para enviar un mensaje de prueba y verificar
// que el servicio de WhatsApp está funcionando correctamente.

const { Router } = require('express');
// Importamos la función específica del controlador para enviar el mensaje de prueba.
const { testMessage } = require('../controller/qrCodeController.js');

const router = Router();

// --- DEFINICIÓN DE ENDPOINT ---

// Endpoint para enviar un mensaje de prueba.
// Se activa con una petición GET a /api/test.
router.get('/', testMessage);

// Exportamos el enrutador.
module.exports = router;