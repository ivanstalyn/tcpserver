
const logger = require('../helpers/logger');
const Cabecera = require('./cabecera');
const Cliente = require('./cliente');
const Factura = require('./factura');

class Transaccion {

  constructor(trama) {
    // 2025111921570800019999000000000000000000000000000000011712705936xxxxxxxxxxxxxxx
    this.trama = trama;
    this.cabecera = new Cabecera(trama);
    this.datos = trama.substring(54); // 1712705936xxxxxxxxxxxxxxx
  };

  getRespuesta() {

    switch (this.cabecera.codigoTransaccion) {
      case '0001':
        return this.getDatoscliente();

      case '0002':
        return this.getDatosFactura();

      default:
        this.cabecera.codigoRespuesta = '5555';
        return `${this.cabecera.getTrama()}${this.datos}`;

    }

  };

  getDatoscliente(){
    // 2025111921570800019999000000000000000000000000000000011712705936
    let cliente = new Cliente(this.datos.substring(0, 10));
    cliente.consultar();
    this.cabecera.codigoRespuesta = '0000';
    this.cabecera.codigoTransaccion = '1001';
    return `${this.cabecera.getTrama()}${cliente.getTrama()}`;
  };

  getDatosFactura(){
    // 2025111921570800029999000000000000000000000000000000270000000123
    let factura = new Factura(this.datos.substring(0, 10));
    factura.consultar();
    let datosFactura = factura.getTrama();
    this.cabecera.codigoRespuesta = '0000';
    this.cabecera.codigoTransaccion = '2002';
    return `${this.cabecera.getTrama()}${datosFactura}`;
  };


}

module.exports = Transaccion;
