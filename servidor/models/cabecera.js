const logger = require('../helpers/logger');

class Cabecera {

  constructor(trama) {
    // 2025111921570800019999000000000000000000000000000000011712705936xxxxxxxxxxxxxxx
    let logLocation = `Cabecera::${this.constructor.name}`;
    this.fecha = trama.substring(0, 8); // 20251119
    this.hora = trama.substring(8, 14); // 215708
    this.codigoTransaccion = trama.substring(14, 18); // 0001
    this.codigoRespuesta = trama.substring(18, 22); // 9999
    this.id = trama.substring(22, 54); // 00000000000000000000000000000001
    this._printData(logLocation);
  };

  getTrama(){
    return `${this.fecha}${this.hora}${this.codigoTransaccion}${this.codigoRespuesta}${this.id.padStart(32, ' ')}`;
  }

  _printData(logLocation = ''){
    Object.keys(this).forEach(property => {
      logger.trace(`Cabecera ${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = Cabecera;
