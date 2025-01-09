# Proyecto: API de reporte de stock de materiales por whatsapp

Este proyecto es una API construida con Node.js y Express.js que ofrece diversas funcionalidades como generación de códigos QR, manejo de reportes, conversión de archivos Excel, y gestión de contactos.

## Estructura del Proyecto

El archivo principal de configuración es `Server.js`, el cual se encarga de inicializar el servidor, configurar las rutas, y gestionar los middlewares. 


## Rutas:

    - `/api/qrcode`: Ruta para la generación de códigos QR.
    - `/api/report`: Ruta para la gestión de reportes.
    - `/api/excel`: Ruta para la conversión de archivos Excel.
    - `/api/contact`: Ruta para la gestión de contactos.
    - `/api/test`: Ruta para pruebas.

### Variables de Entorno

    PORT: 5040

## Formato excel del SAP

Se muestra el farmato de excel que se extre del SAP de materiales de cada unidad: 

![Captura de pantalla del Fortmato del excel que se extrae del SAP](/assets/formatoSAP.png)


## Formato excel de los contactos de whatsapp

Se muestra el formato de excel del archivo de contactos a enviar el listado de materiales por almacén de técnico:

![Captura de pantalla del Formato excel de contacto de whatsapp de los técnicos](/assets/contactosDeWhatsapp.png)


## Captura de la aplicación

![Captura de app](/assets/appReport1.png)
![Captura de app](/assets/appReport2.png)

## Servidor Raspberry pi 5

![Servidor](/assets/servidorAPI.jpeg)