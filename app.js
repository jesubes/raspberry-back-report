const Server = require('./src/models/server')

const server = new Server();

server.isPathReport();
server.listen();
