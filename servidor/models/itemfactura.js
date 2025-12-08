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
    let cantidad = fakerES.number.int({ min: 1, max: 20 });// Cantidad entre 1 y 20
    let precio = parseFloat(fakerES.commerce.price({ min: 1, max: 200 })).toFixed(2); // Precio entre 10 y 200 con 2 decimales
    let subTotal = parseFloat(cantidad * precio).toFixed(2); // Subtotal = cantidad * precio
    let iva = parseFloat(subTotal * 0.15).toFixed(2); // IVA = 15% del subtotal ajustado a 2 decimales
    let total = parseFloat(subTotal + iva).toFixed(2); // Total = subtotal + iva ajustado a 2 decimales

    this.orden = orden.toString().padStart(4, '0'); // 4 caracteres para el orden del item
    this.codigo = fakerES.string.alphanumeric(5).toUpperCase().slice(0, 5).padStart(5); // 5 caracteres para el codigo del producto
    this.producto = fakerES.commerce.product().slice(0, 20).padStart(20); // 20 caracteres para el nombre del producto
    this.productoNombre = fakerES.commerce.product().slice(0, 20).padStart(20); // 20 caracteres para el nombre del producto
    this.cantidad = cantidad.toString().padStart(15, '0'); // Rellena la cantidad a la izquierda con ceros hasta 15 caracteres
    this.precio = precio.toString().replace('.', '').padStart(15, '0'); // Rellena el precio a la izquierda con ceros hasta 15 caracteres sin el punto decimal
    this.subTotal = subTotal.toString().replace('.', '').padStart(15, '0'); // Rellena el subtotal a la izquierda con ceros hasta 15 caracteres sin el punto decimal
    this.iva = iva.toString().replace('.', '').padStart(15, '0'); // Rellena el iva a la izquierda con ceros hasta 15 caracteres sin el punto decimal
    this.total = total.toString().replace('.', '').padStart(15, '0'); // Rellena el total a la izquierda con ceros hasta 15 caracteres sin el punto decimal

    this._printData(logLocation); // Imprime los datos del item
  };

  /* Metodo que genera la trama del item de la factura */
  /* Retorna la trama completa del item */
  /* Formato:
   | ORDEN(4) | CODIGO(5) | PRODUCTO(20) | PRODUCTO_NOMBRE(20) | CANTIDAD(15) | PRECIO(15) | SUBTOTAL(15) | IVA(15) | TOTAL(15) |
  */
  /* retorna un total de 4 + 5 + 20 + 20 + 15 + 15 + 15 + 15 + 15 = 124 caracteres */
  getTrama(){
    return `${this.orden}${this.codigo}${this.producto}${this.productoNombre}${this.cantidad}${this.precio}${this.subTotal}${this.iva}${this.total}`;
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
