/* eslint-disable max-len */
const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');

/* Clase que representa un item de la factura */
/* Cada item tiene un orden, codigo, producto, cantidad, precio, subtotal, iva y total */
class ItemFactura {

  /* Constructor del item de la factura */
  /* Recibe el orden del item */
  constructor(orden) {

    let logLocation = `ItemFactura::${this.constructor.name}`;
    this.orden = orden.toString(); // 4 caracteres para el orden del item
    this.codigo = fakerES.string.alphanumeric(5).toUpperCase(); // 5 caracteres para el codigo del producto
    this.producto = fakerES.commerce.product(); // 20 caracteres para el nombre del producto
    this.productoNombre = fakerES.commerce.product(); // 20 caracteres para el nombre del producto
    this.cantidad = fakerES.number.int({ min: 1, max: 20 });// Cantidad entre 1 y 20
    this.precio = fakerES.commerce.price({ min: 10, max: 200 }); // Precio entre 10 y 200
    this.subTotal = (this.cantidad * parseFloat(this.precio)).toFixed(2); // Subtotal = cantidad * precio
    this.iva = (parseFloat(this.subTotal) * 0.15).toFixed(2); // IVA = 15% del subtotal ajustado a 2 decimales
    this.total = (parseFloat(this.subTotal) + parseFloat(this.iva)).toFixed(2); // Total = subtotal + iva ajustado a 2 decimales
    this._printData(logLocation); // Imprime los datos del item
  };

  /* Metodo que genera la trama del item de la factura */
  /* Retorna la trama completa del item */
  /* Formato:
   | ORDEN(4) | CODIGO(5) | PRODUCTO(20) | PRODUCTO_NOMBRE(20) | CANTIDAD(15) | PRECIO(15) | SUBTOTAL(15) | IVA(15) | TOTAL(15) |
  */
  /* retorna un total de 4 + 5 + 20 + 20 + 15 + 15 + 15 + 15 + 15 = 124 caracteres */
  getTrama(){
    let respuesta = `${this.orden.padStart(4, '0')}${this.codigo}${this.producto.padStart(20)}${this.productoNombre.padStart(20)}`;
    respuesta += `${this.cantidad.toString().padStart(15, '0')}${this.precio.toString().replace('.', '').padStart(15, '0')}`;
    respuesta += `${this.subTotal.toString().replace('.', '').padStart(15, '0')}`;
    respuesta += `${this.iva.toString().replace('.', '').padStart(15, '0')}${this.total.toString().replace('.', '').padStart(15, '0')}`;
    return respuesta;
  };

  /* Metodo que imprime los datos del item */
  /* Util para depuracion */
  /* Recibe la ubicacion del log */
  _printData(logLocation = ''){
    Object.keys(this).forEach(property => {
      logger.trace(`item ${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = ItemFactura;
