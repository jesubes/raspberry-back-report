// =======================================================================================
//                                  CONFIGURACIÓN CENTRALIZADA
// =======================================================================================
// Este archivo centraliza toda la configuración de la aplicación. Lee las variables
// de entorno y proporciona valores por defecto para un funcionamiento consistente.

// Cargamos las variables de entorno desde el archivo .env.
require('dotenv').config();

const config = {
    // Puerto en el que correrá el servidor. Lee de la variable de entorno PORT, o usa 5040 por defecto.
    port: process.env.PORT || 5040,

    // Número de teléfono para usar en la ruta de prueba /api/test.
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '5493816422116',

    // Columnas a extraer del Excel de reporte de materiales.
    reportColumns: [
        "Material",
        "Texto breve de material",
        "Libre utilización",
        "Lote",
        "Almacén"
    ],

    // Columnas a extraer del Excel de lista de contactos.
    contactColumns: [
        "Almacén",
        "Nombre",
        "Numero",
        "Supervisor"
    ]
};

module.exports = config;