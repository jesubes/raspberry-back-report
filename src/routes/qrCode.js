// =======================================================================================
//                                  DEFINICIÓN DE RUTA: QR CODE Y SESIÓN
// =======================================================================================
// Este archivo define las rutas para el endpoint /api/qrcode.

const { Router } = require('express');
// Importamos las funciones del controlador que manejan la lógica de la sesión.
const { startWhatsappForClient, qrGenerate } = require('../controller/qrCodeController');
// Importamos nuestro middleware de validación para el ID de usuario.
const { validateUserId } = require('../middlewares/validators');

const router = Router();

// --- DEFINICIÓN DE ENDPOINTS ---

// Endpoint para obtener el código QR de una sesión específica.
// Se activa con una petición GET a /api/qrcode/gen/:id.
// Primero se ejecuta el middleware de validación, y si es exitoso, se pasa al controlador.
router.get('/gen/:id', validateUserId, qrGenerate);

// Endpoint para iniciar el proceso de autenticación de una nueva sesión de WhatsApp.
// Se activa con una petición GET a /api/qrcode/start/:id.
// También utiliza el middleware de validación para el ID.
router.get('/start/:id', validateUserId, startWhatsappForClient);

// Exportamos el enrutador.
module.exports = router;