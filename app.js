const Server = require('./src/models/server')
const path = require('path')
const authFolderPath = path.join(__dirname, '.wwebjs_auth'); // Ruta relativa
const server = new Server();


server.isPathReport();
server.removeSession(authFolderPath)
server.listen();
