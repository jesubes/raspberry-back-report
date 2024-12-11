//path --> report:     '/api/report',

const { Router } = require('express');
const { reportForMsg } = require('../controller/reportController');

const router = Router();

//Crear una imagen con un almacen ya filtrado del frontend en un JSON
router.post('/', reportForMsg)

module.exports = router