/* eslint-disable max-len */
const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');
const { withLenPrefix } = require('../helpers/util');

/* Clase que representa un item de la factura */
/* Cada item tiene un orden, codigo, producto, cantidad, precio, subtotal, iva y total */
class ItemFactura {

  /* Constructor del item de la factura */
  /* Recibe el orden del item */
  constructor(orden) {

    let logLocation = `ItemFactura::${this.constructor.name}`;
    // Helper para redondear a 2 decimales manteniendo tipo Number
    const round2 = v => Math.round(v * 100) / 100;

    // Valores numéricos (se formatean sólo al construir la trama)
    const cantidad = fakerES.number.int({ min: 1, max: 20 }); // cantidad entera entre 1 y 20
    const precio = Number(fakerES.commerce.price({ min: 1, max: 200 })); // precio entre 1 y 200

    const subTotal = round2(cantidad * precio);
    const iva = round2(subTotal * 0.15); // 15% IVA
    const total = round2(subTotal + iva);


    this.orden = orden.toString();
    this.codigo = fakerES.string.alphanumeric(5).toUpperCase();
    this.producto = fakerES.commerce.product();
    this.productoNombre = fakerES.commerce.product();
    // Formateamos con 2 decimales y removemos el separador decimal
    this.cantidad = cantidad.toFixed(2).replace('.', '');
    this.precio = precio.toFixed(2).replace('.', '');
    this.subTotal = subTotal.toFixed(2).replace('.', '');
    this.iva = iva.toFixed(2).replace('.', '');
    this.total = total.toFixed(2).replace('.', '');

    this._printData(logLocation); // Imprime los datos del item
  };

  /* Metodo que genera la trama del item de la factura */
  /* Retorna la trama completa del item */
  /* Formato:
   | ORDEN(4) | CODIGO(5) | PRODUCTO(20) | PRODUCTO_NOMBRE(20) | CANTIDAD(15) | PRECIO(15) | SUBTOTAL(15) | IVA(15) | TOTAL(15) |
  */
  /* retorna un total de 4 + 5 + 20 + 20 + 15 + 15 + 15 + 15 + 15 = 124 caracteres */
  getTrama(){

    let logLocation = `ItemFactura::${this.getTrama.name}`;

    this.orden = this.orden.padStart(4, '0'); // 4 caracteres para el orden del item
    this.codigo = this.codigo.slice(0, 5).padEnd(5); // 5 caracteres para el codigo del producto
    this.producto = this.producto.slice(0, 20).padEnd(20); // 20 caracteres para el nombre del producto
    this.productoNombre = this.productoNombre.slice(0, 20).padEnd(20); // 20 caracteres para el nombre del producto
    // Rellenar
    this.cantidad = this.cantidad.padStart(15, '0');
    this.precio = this.precio.padStart(15, '0');
    this.subTotal = this.subTotal.padStart(15, '0');
    this.iva = this.iva.padStart(15, '0');
    this.total = this.total.padStart(15, '0');

    this._printData(logLocation); // Imprime los datos del item

    return `${this.orden}${this.codigo}${this.producto}${this.productoNombre}${this.cantidad}${this.precio}${this.subTotal}${this.iva}${this.total}`;
  };

  /* Metodo que genera la trama del item de la factura */
  /* Retorna la trama completa del item */
  /* Formato:
   | ORDEN(n) | CODIGO(n) | PRODUCTO(n) | PRODUCTO_NOMBRE(n) | CANTIDAD(n) | PRECIO(n) | SUBTOTAL(n) | IVA(n) | TOTAL(n) |
  */
  /* retorna una trama de tamaño variable */
  getTramaVariable(){

    let logLocation = `ItemFactura::${this.getTrama.name}`;

    this.orden = withLenPrefix(this.orden);
    this.codigo = withLenPrefix(this.codigo);
    this.producto = withLenPrefix(this.producto);
    this.productoNombre = withLenPrefix(this.productoNombre);
    this.cantidad = withLenPrefix(this.cantidad);
    this.precio = withLenPrefix(this.precio);
    this.subTotal = withLenPrefix(this.subTotal);
    this.iva = withLenPrefix(this.iva);
    this.total = withLenPrefix(this.total);

    this._printData(logLocation); // Imprime los datos del item

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
