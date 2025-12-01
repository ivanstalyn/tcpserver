const net = require('net');
const logger = require('../helpers/logger');
const Transaccion = require('./transaccion');
const {delay} = require('../helpers/util');

/* Clase que representa un servidor TCP */

class TCPServer {

  /* Constructor del servidor */
  /* Recibe el puerto y host dentro de un objeto */
  /* Por defecto puerto 9000 y host 'na' */
  constructor(params = { port: 9000, host: 'na' }) {
    this.port = params.port; // Puerto del servidor
    this.host = params.host; // Host del servidor
    this.server = net.createServer(); // Crea el servidor TCP
    this.connections = new Set(); // Conexiones activas
    this.clientId = 1; // ID del cliente

    /* Maneja los eventos del servidor */
    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', this.handleError.bind(this));
    this.server.on('close', this.handleClose.bind(this));
  };

  /* Metodo que maneja la conexion de un cliente */
  handleConnection(socket) {
    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.id = this.clientId++;
    console.log(`Cliente ${socket.id} conectado: ${clientAddress}`);
    this.connections.add(socket);

    /* Maneja los eventos del socket */
    /* Evento data: cuando el cliente envia datos */
    socket.on('data', (data) => {
      logger.info(`Data del cliente ${socket.id} desde ${clientAddress}: ${data.toString().trim()}`);

      let trx = new Transaccion(data.toString());
      let respuesta = trx.getRespuesta();
      delay();
      let is_kernel_buffer_full = socket.write(`${respuesta}\n`);
      logger.info(`Data respuesta a cliente ${socket.id}: ${respuesta}`);
      if (is_kernel_buffer_full) {
        logger.debug(`Datos enviados exitosamente desde kernel buffer a cliente ${socket.id}!`, 'data');
        // socket.end();
      } else {
        socket.pause();
      }

    });

    /* Evento drain: cuando el buffer del kernel esta vacio */
    socket.on('drain', () => {
      logger.debug(`Drain stream para cliente ${socket.id}`, 'drain');
      socket.resume();
    });

    /* Evento end: cuando el cliente se desconecta */
    socket.on('end', () => {
      logger.info(`Cliente ${socket.id} desconectado: ${clientAddress}`, 'end');
      this.connections.delete(socket);
    });

    /* Evento error: cuando ocurre un error en el socket */
    socket.on('error', (err) => {
      logger.error(`Socket error desde ${clientAddress} (cliente: ${socket.id}): ${err.message}`, 'error');
      this.connections.delete(socket);
    });
  }

  /* Metodo que maneja los errores del servidor */
  handleError(err) {
    logger.error(`Server error: ${err.message}`, 'handleError');
  }

  /* Metodo que maneja el cierre del servidor */
  handleClose() {
    logger.info('TCP Server cerrado', 'handleClose');
  }

  /* Metodo que inicia el servidor */
  start() {

    /* Inicia el servidor en el puerto y host especificados */
    if (this.host !== 'na') {
      /* Inicia el servidor en el puerto especificado si el host es 'na' */
      this.server.listen(this.port, () => {
        logger.info(`TCP Server escuchando en ${this.port}`, 'start');
      });
    } else {
      /* Inicia el servidor en el puerto y host especificados */
      this.server.listen(this.port, this.host, () => {
        logger.info(`TCP Server escuchando en ${this.host}:${this.port}`, 'start');
      });
    }
  };

  /* Metodo que detiene el servidor */
  stop() {
    this.server.close(() => {
      logger.info('Deteniendo TCP server...', 'stop');
    });
    this.connections.forEach(socket => socket.destroy());
  };
}

module.exports = TCPServer;
