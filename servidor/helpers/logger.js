const log4js = require('log4js');
/* Configuracion de log4js */
log4js.configure({
  appenders: {
    console: { type: 'console' },
  },
  categories: {
    default: { appenders: ['console'], level: 'TRACE' },
  },
});
/* Obtiene el logger de log4js */
const log4jsLogger = log4js.getLogger();

/* Definicion de niveles de log */
const Level = {
  TRACE: { priority: 0, outputString: 'TRACE' },
  DEBUG: { priority: 100, outputString: 'DEBUG' },
  INFO: { priority: 200, outputString: 'INFO' },
  WARN: { priority: 300, outputString: 'WARN' },
  ERROR: { priority: 400, outputString: 'ERROR' },
  FATAL: { priority: 500, outputString: 'FATAL' },
  MARK: { priority: 600, outputString: 'MARK' },
  OFF: { priority: 1000, outputString: 'OFF' },
};
/* Nivel de log por defecto */
let logLevel = Level.INFO;

/**
 * Permite cambiar el log level
 * a un nuevo valor
 * @param {Level} newLevel - the new log Level
 */
const setLogLevel = (newLevel) => {
  logLevel = newLevel;
};

/* Funcion que permite setear el nivel de log por nombre */
const setLogLevelByName = (newLevel) => {
  switch (newLevel) {
    case 'TRACE':
      setLogLevel(Level.TRACE);
      break;
    case 'DEBUG':
      setLogLevel(Level.DEBUG);
      break;
    case 'WARN':
      setLogLevel(Level.WARN);
      break;
    case 'ERROR':
      setLogLevel(Level.ERROR);
      break;
    case 'FATAL':
      setLogLevel(Level.FATAL);
      break;
    case 'MARK':
      setLogLevel(Level.MARK);
      break;
    case 'OFF':
      setLogLevel(Level.OFF);
      break;
    case 'INFO':
    default:
      setLogLevel(Level.INFO);
  }
};
/* Setea el nivel de log inicial desde la variable de entorno */
setLogLevelByName(process.env.LOG_LEVEL);
/* Funcion que maneja el logueo de mensajes */
/* Recibe el nivel del mensaje, el mensaje, la fuente y una funcion de logueo opcional */
/* Retorna el mensaje logueado o null si no se loguea */
const log = (messageLogLevel, message, source, logFunction) => {
  let computedMessage = null;
  if (messageLogLevel.priority >= logLevel.priority) {
    computedMessage = ((source) ? '[ ' + source + ' ] -- ' : '[na] -- ') + ((typeof message === 'object' && message !== null) ? JSON.stringify(message) : message);
    (logFunction) ? logFunction(computedMessage, messageLogLevel) : logMessage(computedMessage, messageLogLevel);
  }

  return computedMessage;
};
/* Funcion que realiza el logueo segun el nivel */
/* Recibe el mensaje computado y el nivel del mensaje */
const logMessage = (computedMessage, messageLogLevel) => {
  switch (messageLogLevel) {
    case Level.TRACE:
      log4jsLogger.trace(computedMessage);
      break;
    case Level.DEBUG:
      log4jsLogger.debug(computedMessage);
      break;
    case Level.WARN:
      log4jsLogger.warn(computedMessage);
      break;
    case Level.ERROR:
      log4jsLogger.error(computedMessage);
      break;
    case Level.FATAL:
      log4jsLogger.fatal(computedMessage);
      break;
    case Level.MARK:
      log4jsLogger.mark(computedMessage);
      break;
    case Level.INFO:
    default:
      log4jsLogger.info(computedMessage);
  }
};

/* Funciones de logueo por nivel */
/* Retornan el mensaje logueado o null si no se loguea */
/* Funcion que maneja el logueo de trazas */
const trace = (message, source, logFunction) => {
  return log(Level.TRACE, message, source, logFunction);
};

/* Funcion que maneja el logueo de debug */
const debug = (message, source, logFunction) => {
  return log(Level.DEBUG, message, source, logFunction);
};

/* Funcion que maneja el logueo de informacion */
const info = (message, source, logFunction) => {
  return log(Level.INFO, message, source, logFunction);
};

/* Funcion que maneja el logueo de advertencias */
const warn = (message, source, logFunction) => {
  return log(Level.WARN, message, source, logFunction);
};

/* Funcion que maneja el logueo de errores */
const error = (message, source, logFunction) => {
  return log(Level.ERROR, message, source, logFunction);
};

/* Funcion que maneja el logueo de mensajes fatales */
const fatal = (message, source, logFunction) => {
  return log(Level.FATAL, message, source, logFunction);
};

/* Funcion que maneja el logueo de marcas */
const mark = (message, source, logFunction) => {
  return log(Level.MARK, message, source, logFunction);
};

/* Funcion que maneja el logueo de errores */
/* Recibe el objeto error y la fuente */
const logCatch = (_errObject, _source) => {

  if (_errObject.message){
    error(_errObject.message, _source);
  } else {
    error(_errObject, _source);
  }

  if (_errObject.stack) {
    debug(_errObject.stack, _source);
  }

};

module.exports = {
  Level,
  setLogLevelByName,
  setLogLevel,
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
  mark,
  log,
  logCatch,
};
