const logger = require('../helpers/logger');

/* Clase que representa la cabecera de una trama */
class Cabecera {
  /* Constructor de la cabecera
  Recibe la trama completa
  La cabecera tiene los primeros 58 caracteres
  Formato:
   20251119 215708 0001 9999 faf89fc4-22a8-43a9-9a69-ebf1ed959964
   |--------|------|----|----|----------------------------------|
      fecha   hora   cod   cod            trxId
  */
  constructor(trama) {

    let logLocation = `Cabecera::${this.constructor.name}`;
    this.fecha = trama.substring(0, 8); // los primeros 8 caracteres para la fecha
    this.hora = trama.substring(8, 14); // Los siguientes 6 caracteres para la hora
    this.tipoTransaccion = trama.substring(14, 18); // Los siguientes 4 caracteres para el código del tipo de transacción
    this.codigoRespuesta = trama.substring(18, 22); // Los siguientes 4 caracteres para el código de respuesta
    this.trxId = trama.substring(22, 58); // Los siguientes 36 caracteres para el identificador de la transacción
    /* Imprime los datos de la cabecera */
    this._printData(logLocation);
  };

  /* Metodo que genera la trama de la cabecera */
  /* Retorna la trama completa de la cabecera */
  /* Formato:
   20251119 215708 0001 9999 faf89fc4-22a8-43a9-9a69-ebf1ed959964
   |--------|------|----|----|----------------------------------|
      fecha   hora   cod   cod            trxId
  */
  /* retorna un total de 58 caracteres */

  getTrama(){
    return `${this.fecha}${this.hora}${this.tipoTransaccion}${this.codigoRespuesta}${this.trxId}`;
  }

  /* Metodo que imprime los datos de la cabecera */
  /* Util para depuracion */
  /* Recibe la ubicacion del log */
  /* Retorna void */
  _printData(logLocation = ''){
    Object.keys(this).forEach(property => {
      logger.trace(`Cabecera ${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = Cabecera;
