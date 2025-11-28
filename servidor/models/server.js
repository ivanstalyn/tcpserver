const net = require('net');
const logger = require('../helpers/logger');
const Transaccion = require('./transaccion');
const {delay} = require('../helpers/util');

class TCPServer {

  constructor(params = { port: 9000, host: '127.0.0.1' }) {
    this.port = params.port;
    this.host = params.host;
    this.server = net.createServer();
    this.connections = new Set();
    this.clientId = 1;

    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', this.handleError.bind(this));
    this.server.on('close', this.handleClose.bind(this));
  };

  handleConnection(socket) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.id = this.clientId++;
    console.log(`Cliente ${socket.id} conectado: ${clientAddress}`);
    this.connections.add(socket);

    socket.on('data', (data) => {
      logger.info(`Data del cliente ${socket.id} desde ${clientAddress}: ${data.toString().trim()}`);

      let trx = new Transaccion(data.toString());
      let respuesta = trx.getRespuesta();
      delay();
      let is_kernel_buffer_full = socket.write(`${respuesta}\n`);
      logger.info(`Data respuesta a cliente ${socket.id}: ${respuesta}`);
      if (is_kernel_buffer_full) {
        logger.debug(`Datos enviados exitosamente desde kernel buffer a cliente ${socket.id}!`, 'data');
        //socket.end();
      } else {
        socket.pause();
      }

    });

    socket.on('drain', () => {
      logger.debug(`Drain stream para cliente ${socket.id}`, 'drain');
      socket.resume();
    });

    socket.on('end', () => {
      logger.info(`Cliente ${socket.id} desconectado: ${clientAddress}`, 'end');
      this.connections.delete(socket);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error desde ${clientAddress} (cliente: ${socket.id}): ${err.message}`, 'error');
      this.connections.delete(socket);
    });
  }

  handleError(err) {
    logger.error(`Server error: ${err.message}`, 'handleError');
  }

  handleClose() {
    logger.info('TCP Server cerrado', 'handleClose');
  }

  start() {
    this.server.listen(this.port, this.host, () => {
      logger.info(`TCP Server escuchando en ${this.host}:${this.port}`, 'start');
    });
  };

  stop() {
    this.server.close(() => {
      logger.info('Deteniendo TCP server...', 'stop');
    });
    this.connections.forEach(socket => socket.destroy());
  }
}

module.exports = TCPServer;
