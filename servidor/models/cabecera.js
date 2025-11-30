const logger = require('../helpers/logger');

/* Clase que representa la cabecera de una trama */
class Cabecera {
  /* Constructor de la cabecera
  Recibe la trama completa
  La cabecera tiene los primeros 54 caracteres
  Formato:
   20251119 215708 0001 9999 00000000000000000000000000000001
   |--------|------|----|----|------------------------------|
      fecha   hora   cod   cod            id
  */
  constructor(trama) {

    let logLocation = `Cabecera::${this.constructor.name}`;
    this.fecha = trama.substring(0, 8); // los primeros 8 caracteres para la fecha
    this.hora = trama.substring(8, 14); // Los siguientes 6 caracteres para la hora
    this.codigoTransaccion = trama.substring(14, 18); // Los siguientes 4 caracteres para el codigo de transaccion
    this.codigoRespuesta = trama.substring(18, 22); // Los siguientes 4 caracteres para el codigo de respuesta
    this.id = trama.substring(22, 54); // Los siguientes 32 caracteres para el id
    /* Imprime los datos de la cabecera */
    this._printData(logLocation);
  };

  /* Metodo que genera la trama de la cabecera */
  /* Retorna la trama completa de la cabecera */
  /* Formato:
   20251119 215708 0001 9999 00000000000000000000000000000001
   |--------|------|----|----|------------------------------|
      fecha   hora   cod   cod            id
  */
  /* retorna un total de 54 caracteres */

  getTrama(){
    return `${this.fecha}${this.hora}${this.codigoTransaccion}${this.codigoRespuesta}${this.id.padStart(32, ' ')}`;
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
