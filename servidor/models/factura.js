/* eslint-disable max-len */
const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');
const Cliente = require('./cliente');
const ItemFactura = require('./itemfactura');

class Factura {

  constructor(trama) {
    // 0000000123
    let logLocation = `Factura::${this.constructor.name}`;
    this.nro = trama.substring(0, 10); // 1712705936
    this.cliente = new Cliente(fakerES.string.numeric(10));
    this.detalleItems = [];
    this._printData(logLocation);
  };

  consultar(){
    let logLocation = `Factura::${this.consultar.name}`;
    this.cliente.consultar();
    this._printData(logLocation);

  };

  getTrama(){
    return `${this.nro}${this.cliente.getTrama()}${this.generarDetalle()}`;
  };

  generarDetalle(){
    let logLocation = `Factura::${this.generarDetalle.name}`;
    let respuesta = '';

    for (let index = 0; index < 10; index++) {
      let item = new ItemFactura(index + 1);
      this.detalleItems.push(item);
      respuesta += item.getTrama();
    }
    this._printData(logLocation);
    return respuesta;

  };

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
