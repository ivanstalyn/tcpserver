const Cabecera = require('./cabecera');
const Cliente = require('./cliente');
const Factura = require('./factura');

/* Clase que representa una transacción */
class Transaccion {

  /* Constructor de la transacción
   * Recibe la trama de la transacción
   * La trama es una cadena de texto con la informacion de la transacción
   * Ejemplo: 2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936
   */
  constructor(trama) {
    this.trama = trama; // Trama de la transacción
    this.cabecera = new Cabecera(trama); // Cabecera de la transacción
    this.datos = trama.substring(58); // Datos adicionales despues de la cabecera
  };

  /* Metodo que obtiene la respuesta de la transacción
   * Retorna una cadena de texto con la respuesta
   * La respuesta depende del codigo de transacción
   */

  getRespuesta() {

    /* Selecciona la accion según el codigo de transacción */
    switch (this.cabecera.tipoTransaccion) {
      case '0001':
        /* Obtener datos del cliente */
        return this.getDatoscliente();

      case '0002':
        /* Obtener datos de la factura */
        return this.getDatosFactura();

      default:
        /* Código de transacción no reconocido */
        this.cabecera.codigoRespuesta = '5555';
        return `${this.cabecera.getTrama()}${this.datos}`;

    }

  };

  getDatoscliente(){
    /* Ejemplo trana de consulta de un cliente:
     * 2025111921570800019999faf89fc4-22a8-43a9-9a69-ebf1ed9599641712705936
     * Extrae los datos del cliente
     * 1712705936 es el numero de cliente
     */
    let cliente = new Cliente(this.datos.substring(0, 10)); // 1712705936
    cliente.consultar(); // Consulta los datos del cliente
    this.cabecera.codigoRespuesta = '0000'; // Código de respuesta exitoso
    this.cabecera.tipoTransaccion = '1001'; // Código de transacción de respuesta
    return `${this.cabecera.getTrama()}${cliente.getTrama()}`;
  };

  getDatosFactura(){
    /* Ejemplo trama de consulta de una factura:
     *  2025111921570800029999faf89fc4-22a8-43a9-9a69-ebf1ed959964002-003-000004743
     * Extrae los datos de la factura
     * 002-003-000004743 es el numero de factura
     */
    let factura = new Factura(this.datos.substring(0, 17)); // 002-003-000004743
    factura.consultar(); // Consulta los datos de la factura
    let datosFactura = factura.getTrama(); // Obtiene la trama de la factura
    this.cabecera.codigoRespuesta = '0000'; // Código de respuesta exitoso
    this.cabecera.tipoTransaccion = '2002'; // Código de transacción de respuesta
    return `${this.cabecera.getTrama()}${datosFactura}`;
  };


}

module.exports = Transaccion;
