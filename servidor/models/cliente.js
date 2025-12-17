const { fakerES } = require('@faker-js/faker');
const logger = require('../helpers/logger');
const { withLenPrefix } = require('../helpers/util');

/* Clase que representa un cliente */
class Cliente {

  /* Constructor del cliente */
  /* Recibe la trama completa */
  constructor(trama) {

    let logLocation = `Cliente::${this.constructor.name}`;
    this.id = trama.substring(0, 10); // 10 caracteres para el ID del cliente
    // Inicializa las demas propiedades vacias
    this.nombre = '';
    this.apellido = '';
    this.direccion = '';
    this.ciudad = '';
    this.celular = '';
    this.email = '';
    /* Imprime los datos del cliente */
    this._printData(logLocation);
  };

  /* Metodo que simula la consulta de datos del cliente */
  /* Utiliza la libreria faker para generar datos aleatorios */

  consultar(){
    let logLocation = `Cliente::${this.consultar.name}`;

    this.nombre = fakerES.person.firstName(); // Genera un nombre aleatorio
    this.apellido = fakerES.person.lastName(); // Genera un apellido aleatorio
    this.direccion = fakerES.location.streetAddress(); // Genera una direccion aleatoria
    this.ciudad = fakerES.location.city(); // Genera una ciudad aleatoria
    this.celular = fakerES.phone.number({style: 'national'}); // Genera un número de celular aleatorio
    this.email = fakerES.internet.email({firstName: this.nombre.trim(), lastName: this.apellido.trim()}); // Genera un email aleatorio
    /* Imprime los datos del cliente */
    this._printData(logLocation);

  };

  /* Metodo que genera la trama fija del cliente */
  /* Retorna la trama completa del cliente */
  /* Formato:
   | ID(10) | NOMBRE(20) | APELLIDO(20) | CELULAR(14) | DIRECCION(100) | CIUDAD(20) | EMAIL(50) |
  */
  /* retorna un total de 234 caracteres */
  getTrama(){

    let logLocation = `Cliente::${this.getTrama.name}`;

    this.nombre = this.nombre.slice(0, 20).padEnd(20); // Limita la cantiad de caracteres a 20 y rellena a la izquierda con espacios
    this.apellido = this.apellido.slice(0, 20).padEnd(20); // Limita la cantiad de caracteres a 20 y rellena a la izquierda con espacios
    this.direccion = this.direccion.slice(0, 100).padEnd(100); // Limita la cantiad de caracteres a 100 y rellena a la izquierda con espacios
    this.ciudad = this.ciudad.slice(0, 20).padEnd(20); // Limita la cantiad de caracteres a 20 y rellena a la izquierda con espacios
    this.celular = this.celular.slice(0, 14).padStart(14); // Limita la cantiad de caracteres a 14 y rellena a la derecha con espacios
    this.email = this.email.slice(0, 50).padEnd(50); // Limita la cantiad de caracteres a 50 y rellena a la izquierda con espacios

    this._printData(logLocation);


    return `${this.id}${this.nombre}${this.apellido}${this.celular}${this.direccion}${this.ciudad}${this.email}`;
  };

  /* Metodo que genera la trama variable del cliente */
  /* Retorna la trama completa del cliente */
  /* Formato:
   | ID(10) | NOMBRE(n) | APELLIDO(n) | CELULAR(n) | DIRECCION(n) | CIUDAD(n) | EMAIL(n) |
  */
  /* retorna una trama de tamaño variable */
  getTramaVariable(){
    let logLocation = `Cliente::${this.getTrama.name}`;

    this.nombre = withLenPrefix(this.nombre);
    this.apellido = withLenPrefix(this.apellido);
    this.direccion = withLenPrefix(this.direccion);
    this.ciudad = withLenPrefix(this.ciudad);
    this.celular = withLenPrefix(this.celular);
    this.email = withLenPrefix(this.email);

    this._printData(logLocation);

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
