const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');

class Cliente {

  constructor(trama) {
    // 1712705936xxxxxxxxxxxxxxx
    let logLocation = `Cliente::${this.constructor.name}`;
    this.id = trama.substring(0, 10); // 1712705936
    this.nombre = '';
    this.apellido = '';
    this.direccion = '';
    this.ciudad = '';
    this.celular = '';
    this.email = '';

    this._printData(logLocation);
  };

  consultar(){
    let logLocation = `Cliente::${this.consultar.name}`;

    this.nombre = fakerES.person.firstName().padStart(20);
    this.apellido = fakerES.person.lastName().padStart(20);
    this.direccion = fakerES.location.streetAddress().padStart(100);
    this.ciudad = fakerES.location.city().padStart(20);
    this.celular = fakerES.phone.number({style: 'national'}).padStart(14);
    this.email = fakerES.internet.email({firstName: this.nombre, lastName: this.apellido}).padStart(50);

    this._printData(logLocation);

  };

  getTrama(){
    return `${this.id}${this.nombre}${this.apellido}${this.celular}${this.direccion}${this.ciudad}${this.email}`;
  };

  _printData(logLocation = ''){
    Object.keys(this).forEach(property => {
      logger.trace(`${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = Cliente;
