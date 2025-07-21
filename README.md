# Backend API: Reporte de Stock y WhatsApp

Este proyecto es una API robusta construida con Node.js y Express.js, diseñada para gestionar reportes de stock de materiales y facilitar la comunicación a través de WhatsApp. Ha sido optimizada para integrarse eficientemente con un frontend moderno (como React.js con TailwindCSS), ofreciendo comunicación en tiempo real y un manejo de errores consistente.

## 🚀 Tecnologías Utilizadas

*   **Node.js**: Entorno de ejecución JavaScript.
*   **Express.js**: Framework web para construir la API.
*   **whatsapp-web.js**: Librería para interactuar con WhatsApp Web.
*   **Socket.IO**: Para comunicación bidireccional en tiempo real (WebSockets).
*   **Puppeteer**: Navegador headless para la generación de imágenes (usado por `whatsapp-web.js` y para convertir JSON a imagen).
*   **XLSX**: Para la lectura y procesamiento de archivos Excel.
*   **Multer**: Middleware para el manejo de `multipart/form-data` (subida de archivos).
*   **express-validator**: Para la validación de datos de entrada en las rutas.
*   **dotenv**: Para la gestión de variables de entorno.
*   **cors**: Middleware para habilitar Cross-Origin Resource Sharing.
*   **nodemon**: Herramienta de desarrollo para reiniciar automáticamente el servidor.

## 📦 Configuración del Proyecto

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm (Node Package Manager)
*   Un navegador Chromium instalado en el sistema (Puppeteer lo utiliza).

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd raspberry-back-report
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=5040
TEST_PHONE_NUMBER=5493816422116 # Número de teléfono para pruebas (con código de país, sin '+ ')
```

### Iniciar el Servidor

Para iniciar el servidor en modo desarrollo (con `nodemon` para reinicio automático):

```bash
npm run dev
```

El servidor se iniciará en el puerto especificado en tu archivo `.env` (por defecto, `http://localhost:5040`).

## 💡 Conceptos Clave para el Frontend

### 1. Gestión de Sesiones de WhatsApp (WebSockets)

La autenticación y el estado de la sesión de WhatsApp se manejan a través de WebSockets para una experiencia en tiempo real.

*   **Conexión Socket.IO**: El frontend debe conectarse al servidor Socket.IO en la misma URL y puerto que la API REST (ej. `http://localhost:5040`).
    ```javascript
    import { io } from 'socket.io-client';
    const socket = io('http://localhost:5040'); // Ajusta la URL según tu entorno

    socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor Socket.IO');
    });
    ```

*   **Unirse a una Sala de Usuario**: Para recibir eventos específicos de una sesión de WhatsApp, el frontend debe unirse a una sala con el `userId` correspondiente. Esto debe hacerse tan pronto como el frontend conozca el `userId` (ej. después de que el usuario inicie el proceso de conexión).
    ```javascript
    // Ejemplo: Unirse a la sala 'miUsuario123'
    socket.emit('joinUserRoom', 'miUsuario123');
    ```

*   **Eventos Emitidos por el Backend**:
    *   `qr_code`: Se emite cuando se genera un nuevo código QR para la autenticación.
        ```javascript
        socket.on('qr_code', (data) => {
            console.log('QR Code recibido:', data.qrCode); // data.qrCode es un DataURL (base64)
            // Actualiza tu UI para mostrar la imagen del QR
        });
        ```
    *   `session_status`: Se emite para informar sobre el estado de la sesión de WhatsApp.
        ```javascript
        socket.on('session_status', (data) => {
            console.log('Estado de sesión:', data.status); // 'ready', 'disconnected', 'auth_failure', 'error'
            // Actualiza tu UI según el estado (ej. "Conectado", "Desconectado", "Error de autenticación")
        });
        ```

### 2. Manejo de Errores Estandarizado

Todas las respuestas de error de la API siguen un formato consistente, facilitando su manejo en el frontend.

*   **Formato de Error**:
    ```json
    {
        "status": "error",
        "message": "Mensaje descriptivo del error."
    }
    ```
*   **Errores de Validación (`express-validator`)**: Cuando la validación de entrada falla, la respuesta incluirá un array de errores detallados.
    ```json
    {
        "status": "error",
        "message": "Error interno del servidor." // O un mensaje más específico si es un ApiError
        "errors": [ // Este campo solo aparece para errores de validación (HTTP 400)
            {
                "type": "field",
                "value": "invalid_value",
                "msg": "Mensaje de error de validación específico.",
                "path": "nombreDelCampo",
                "location": "body" // o "query", "params"
            }
        ]
    }
    ```
    El frontend debe estar preparado para parsear este array `errors` y mostrar los mensajes al usuario junto a los campos de formulario correspondientes.

## 📋 Endpoints de la API

Todos los endpoints base están prefijados con `/api`.

### 1. Gestión de Códigos QR y Sesiones de WhatsApp (`/api/qrcode`)

*   **`GET /api/qrcode/start/:id`**
    *   **Descripción**: Inicia el proceso de inicialización de una nueva sesión de WhatsApp para un `userId` dado. El backend comenzará a generar el QR y emitirá eventos por WebSocket.
    *   **Parámetros de Ruta**:
        *   `id` (string, requerido): Identificador único para la sesión de WhatsApp (ej. `miUsuario123`).
    *   **Respuesta Exitosa (200 OK)**:
        ```json
        {
            "message": "Iniciando proceso para el usuario: miUsuario123. Por favor, solicita el QR en breve."
        }
        ```
    *   **Errores**:
        *   `400 Bad Request`: Si el `id` no es válido (ver Manejo de Errores).

*   **`GET /api/qrcode/gen/:id`**
    *   **Descripción**: Solicita el código QR actual para una sesión específica. Este endpoint es útil para el polling si no se usan WebSockets, pero con WebSockets, el QR se enviará automáticamente.
    *   **Parámetros de Ruta**:
        *   `id` (string, requerido): Identificador único de la sesión.
    *   **Respuesta Exitosa (200 OK)**:
        *   Devuelve una etiqueta `<img>` con el DataURL del QR.
        ```html
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="Escanea este código QR con WhatsApp">
        ```
    *   **Errores**:
        *   `400 Bad Request`: Si el `id` no es válido.
        *   `404 Not Found`: Si el QR no está disponible o el cliente no se ha inicializado.

### 2. Envío de Mensajes de Prueba (`/api/test`)

*   **`GET /api/test`**
    *   **Descripción**: Envía un mensaje de prueba a un número predefinido (configurado en `.env` como `TEST_PHONE_NUMBER`) para verificar que la sesión de WhatsApp está activa y funcionando.
    *   **Respuesta Exitosa (200 OK)**:
        ```json
        {
            "message": "Mensaje de prueba enviado con éxito a 5493816422116."
        }
        ```
    *   **Errores**:
        *   `503 Service Unavailable`: Si el servicio de WhatsApp no está listo.
        *   `404 Not Found`: Si el número de prueba no es un contacto válido de WhatsApp.

### 3. Conversión de Archivos Excel (`/api/excel`)

*   **`POST /api/excel`**
    *   **Descripción**: Sube un archivo Excel y devuelve su contenido como una tabla HTML estilizada.
    *   **Tipo de Contenido**: `multipart/form-data`
    *   **Cuerpo de la Solicitud**:
        *   `fileExcel` (file, requerido): El archivo Excel a subir.
    *   **Respuesta Exitosa (200 OK)**:
        *   Devuelve una cadena HTML que representa la tabla del Excel.
    *   **Errores**:
        *   `400 Bad Request`: Si no se sube ningún archivo o el nombre del campo es incorrecto.

*   **`POST /api/excel/json`**
    *   **Descripción**: Sube un archivo Excel y devuelve su contenido como un array de objetos JSON, filtrando solo las columnas relevantes para el reporte de materiales (definidas en `src/config/index.js`).
    *   **Tipo de Contenido**: `multipart/form-data`
    *   **Cuerpo de la Solicitud**:
        *   `fileExcel` (file, requerido): El archivo Excel a subir.
    *   **Respuesta Exitosa (200 OK)**:
        ```json
        [
            {
                "Material": "1000001",
                "Texto breve de material": "Tornillo M8",
                "Libre utilización": 100,
                "Lote": "LOTE001",
                "Almacén": "ALM01"
            },
            // ... más objetos
        ]
        ```
    *   **Errores**:
        *   `400 Bad Request`: Si no se sube ningún archivo o el nombre del campo es incorrecto.

### 4. Gestión de Contactos Excel (`/api/contact`)

*   **`POST /api/contact`**
    *   **Descripción**: Sube un archivo Excel de contactos y devuelve un array de objetos JSON, filtrando y limpiando los datos para incluir solo contactos válidos (con `Almacén`, `Nombre`, `Numero`). Las columnas relevantes se definen en `src/config/index.js`.
    *   **Tipo de Contenido**: `multipart/form-data`
    *   **Cuerpo de la Solicitud**:
        *   `fileContact` (file, requerido): El archivo Excel de contactos a subir.
    *   **Respuesta Exitosa (200 OK)**:
        ```json
        [
            {
                "Almacén": "ALM01",
                "Nombre": "Juan Perez",
                "Numero": "5493811234567",
                "Supervisor": "Maria Gomez"
            },
            // ... más objetos
        ]
        ```
    *   **Errores**:
        *   `400 Bad Request`: Si no se sube ningún archivo o el nombre del campo es incorrecto.

### 5. Envío de Reportes por WhatsApp (`/api/report`)

*   **`POST /api/report`**
    *   **Descripción**: Recibe datos de un reporte en formato JSON, los convierte en una imagen JPG y luego envía esa imagen junto con un mensaje de texto a un número de WhatsApp específico.
    *   **Parámetros de Consulta (Query Parameters)**:
        *   `number` (string, requerido): El número de teléfono del destinatario (con código de país, sin `+`).
        *   `name` (string, requerido): El nombre del destinatario para el mensaje de saludo.
    *   **Cuerpo de la Solicitud (Request Body)**:
        *   (array de objetos JSON, requerido): Los datos del reporte que se convertirán en imagen. Debe ser un array no vacío.
        ```json
        [
            {
                "Material": "1000001",
                "Texto breve de material": "Tornillo M8",
                "Libre utilización": 100,
                "Lote": "LOTE001",
                "Almacén": "ALM01"
            },
            {
                "Material": "1000002",
                "Texto breve de material": "Tuerca M8",
                "Libre utilización": 50,
                "Lote": "LOTE002",
                "Almacén": "ALM01"
            }
        ]
        ```
    *   **Respuesta Exitosa (200 OK)**:
        ```json
        {
            "messageSent": true
        }
        ```
    *   **Errores**:
        *   `400 Bad Request`: Si faltan parámetros de consulta (`number`, `name`) o el cuerpo de la solicitud no es un array JSON válido.
        *   `503 Service Unavailable`: Si el servicio de WhatsApp no está listo.
        *   `404 Not Found`: Si el número de destino no es un contacto válido de WhatsApp.
        *   `500 Internal Server Error`: Si falla la generación de la imagen o el envío del mensaje por otras razones.
