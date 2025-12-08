const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');

/* Clase que representa un cliente */
class Cliente {

  /* Constructor del cliente */
  /* Recibe la trama completa */
  constructor(trama) {

    let logLocation = `Cliente::${this.constructor.name}`;
    this.id = trama.substring(0, 10); // 10 caracteres para el ID del cliente
    this.nombre = ''; // Inicializa las demas propiedades vacias
    this.apellido = ''; // Inicializa las demas propiedades vacias
    this.direccion = ''; // Inicializa las demas propiedades vacias
    this.ciudad = ''; // Inicializa las demas propiedades vacias
    this.celular = ''; // Inicializa las demas propiedades vacias
    this.email = ''; // Inicializa las demas propiedades vacias
    /* Imprime los datos del cliente */
    this._printData(logLocation);
  };

  /* Metodo que simula la consulta de datos del cliente */
  /* Utiliza la libreria faker para generar datos aleatorios */

  consultar(){
    let logLocation = `Cliente::${this.consultar.name}`;

    this.nombre = fakerES.person.firstName().slice(0, 20).padEnd(20); // Genera un nombre aleatorio
    this.apellido = fakerES.person.lastName().slice(0, 20).padEnd(20); // Genera un apellido aleatorio
    this.direccion = fakerES.location.streetAddress().slice(0, 100).padEnd(100); // Genera una direccion aleatoria
    this.ciudad = fakerES.location.city().slice(0, 20).padEnd(20); // Genera una ciudad aleatoria y rellena a la izquierda con espacios
    this.celular = fakerES.phone.number({style: 'national'}).slice(0, 14).padStart(14); // Genera un numero de celular aleatorio y rellena a la izquierda con espacios
    this.email = fakerES.internet.email({firstName: this.nombre.trim(), lastName: this.apellido.trim()}).slice(0, 50).padEnd(50); // Genera un email aleatorio y rellena a la izquierda con espacios
    /* Imprime los datos del cliente */
    this._printData(logLocation);

  };

  /* Metodo que genera la trama del cliente */
  /* Retorna la trama completa del cliente */
  /* Formato:
   | ID(10) | NOMBRE(20) | APELLIDO(20) | CELULAR(14) | DIRECCION(100) | CIUDAD(20) | EMAIL(50) |
  */
  /* retorna un total de 234 caracteres */
  getTrama(){
    logger.debug(`ID        [${this.id.length}]: '${this.id}'`);
    logger.debug(`NOMBRE    [${this.nombre.length}]: '${this.nombre}'`);
    logger.debug(`APELLIDO  [${this.apellido.length}]: '${this.apellido}'`);
    logger.debug(`CELULAR   [${this.celular.length}]: '${this.celular}'`);
    logger.debug(`DIRECCION [${this.direccion.length}]: '${this.direccion}'`);
    logger.debug(`CIUDAD    [${this.ciudad.length}]: '${this.ciudad}'`);
    logger.debug(`EMAIL     [${this.email.length}]: '${this.email}'`);
    return `${this.id}${this.nombre}${this.apellido}${this.celular}${this.direccion}${this.ciudad}${this.email}`;
  };

  /* Metodo que imprime los datos del cliente */
  /* Util para depuracion */
  /* Recibe la ubicacion del log */
  _printData(logLocation = ''){
    /* Imprime cada propiedad del cliente */
    /* Recorre las propiedades del objeto */
    /* Imprime el nombre de la propiedad y su valor */
    /* Trim para eliminar espacios en blanco */
    /* Retorna void */
    Object.keys(this).forEach(property => {
      logger.trace(`${property}: ${this[property].toString().trim()}`, logLocation);
    });
  };

}

module.exports = Cliente;
