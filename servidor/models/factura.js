/* eslint-disable max-len */
const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');
const Cliente = require('./cliente');
const ItemFactura = require('./itemfactura');

/* Clase que representa una factura */
class Factura {

  /* Constructor de la factura */
  /* Recibe la trama completa */
  constructor(trama) {
    let logLocation = `Factura::${this.constructor.name}`;
    this.nro = trama.substring(0, 10); // 10 caracteres para el numero de factura
    this.cliente = new Cliente(fakerES.string.numeric(10)); // Crea un cliente con un ID aleatorio
    this.detalleItems = []; // Array para almacenar los items de la factura
    /* Imprime los datos de la factura */
    this._printData(logLocation);
  };

  /* Metodo que simula la consulta de datos de la factura */
  /* Utiliza la clase Cliente para consultar los datos del cliente */
  consultar(){
    let logLocation = `Factura::${this.consultar.name}`;
    this.cliente.consultar();
    this._printData(logLocation);

  };

  /* Metodo que genera la trama de la factura */
  /* Retorna la trama completa de la factura */
  /* Formato:
   | NRO(10) | CLIENTE(234) | DETALLE_ITEMS(10 * 100) |
  */
  /* retorna un total de 10 + 234 + 1240 = 1484 caracteres */

  getTrama(){
    return `${this.nro}${this.cliente.getTrama()}${this.generarDetalle()}`;
  };

  /* Metodo que genera el detalle de la factura */
  /* Retorna la trama completa del detalle de la factura */
  /* Cada factura tiene 10 items */
  /* Cada item tiene 124 caracteres */
  /* Formato:
   | ORDEN(4) | CODIGO(5) | PRODUCTO(20) | PRODUCTO_NOMBRE(20) | CANTIDAD(15) | PRECIO(15) | SUBTOTAL(15) | IVA(15) | TOTAL(15) |
  */
  /* retorna un total de 10 * 124 = 1240 caracteres */

  generarDetalle(){
    let logLocation = `Factura::${this.generarDetalle.name}`;
    let respuesta = '';

    /* Genera 10 items de factura */
    for (let index = 0; index < 10; index++) {
      /* Crea un nuevo item de factura */
      let item = new ItemFactura(index + 1);
      /* Agrega el item al array de items de la factura */
      this.detalleItems.push(item);
      /* Agrega la trama del item al detalle de la factura */
      respuesta += item.getTrama();
    }
    /* Imprime los datos del detalle de la factura */
    this._printData(logLocation);
    /* Retorna la trama del detalle de la factura */
    return respuesta;

  };

  /* Metodo que imprime los datos de la factura */
  /* Util para depuracion */
  /* Recibe la ubicacion del log */
  _printData(logLocation = ''){
    logger.trace(`nro: ${this.nro}`, logLocation);
    Object.keys(this.cliente).forEach(key => {
      logger.trace(`cliente ${key}: ${this.cliente[key].trim()}`, logLocation);
    });

    this.detalleItems.forEach(item => {
      Object.keys(item).forEach(key => {
        logger.trace(`item ${key}: ${item[key].toString().trim()}`, logLocation);
      });
    });

  };

}

module.exports = Factura;
