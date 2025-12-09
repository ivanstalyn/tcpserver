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
    // Helper para redondear a 2 decimales manteniendo tipo Number
    const round2 = v => Math.round(v * 100) / 100;

    // Valores numéricos (se formatean sólo al construir la trama)
    const cantidad = fakerES.number.int({ min: 1, max: 20 }); // cantidad entera entre 1 y 20
    const precio = Number(fakerES.commerce.price({ min: 1, max: 200 })); // precio entre 1 y 200

    const subTotal = round2(cantidad * precio);
    const iva = round2(subTotal * 0.15); // 15% IVA
    const total = round2(subTotal + iva);


    this.orden = orden.toString().padStart(4, '0'); // 4 caracteres para el orden del item
    this.codigo = fakerES.string.alphanumeric(5).toUpperCase().slice(0, 5).padEnd(5); // 5 caracteres para el codigo del producto
    this.producto = fakerES.commerce.product().slice(0, 20).padEnd(20); // 20 caracteres para el nombre del producto
    this.productoNombre = fakerES.commerce.product().slice(0, 20).padEnd(20); // 20 caracteres para el nombre del producto
    // Formateamos con 2 decimales y removemos el separador decimal antes de rellenar
    this.cantidad = cantidad.toFixed(2).replace('.', '').padStart(15, '0');
    this.precio = precio.toFixed(2).replace('.', '').padStart(15, '0');
    this.subTotal = subTotal.toFixed(2).replace('.', '').padStart(15, '0');
    this.iva = iva.toFixed(2).replace('.', '').padStart(15, '0');
    this.total = total.toFixed(2).replace('.', '').padStart(15, '0');

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
