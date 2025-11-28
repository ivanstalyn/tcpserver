/* eslint-disable max-len */
const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');

class ItemFactura {

  constructor(orden) {

    let logLocation = `ItemFactura::${this.constructor.name}`;
    this.orden = orden.toString();
    this.codigo = fakerES.string.alphanumeric(5).toUpperCase();
    this.producto = fakerES.commerce.product();
    this.productoNombre = fakerES.commerce.product();
    this.cantidad = fakerES.number.int({ min: 1, max: 20 });
    this.precio = fakerES.commerce.price({ min: 10, max: 200 });
    this.subTotal = (this.cantidad * parseFloat(this.precio)).toFixed(2);
    this.iva = (parseFloat(this.subTotal) * 0.15).toFixed(2);
    this.total = (parseFloat(this.subTotal) + parseFloat(this.iva)).toFixed(2);
    this._printData(logLocation);
  };

  getTrama(){
    let respuesta = `${this.orden.padStart(4, '0')}${this.codigo}${this.producto.padStart(20)}${this.productoNombre.padStart(20)}`;
    respuesta += `${this.cantidad.toString().padStart(15, '0')}${this.precio.toString().replace('.', '').padStart(15, '0')}`;
    respuesta += `${this.subTotal.toString().replace('.', '').padStart(15, '0')}`;
    respuesta += `${this.iva.toString().replace('.', '').padStart(15, '0')}${this.total.toString().replace('.', '').padStart(15, '0')}`;
    return respuesta;
  };

  _printData(logLocation = ''){
    Object.keys(this).forEach(property => {
      logger.trace(`item ${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = ItemFactura;
