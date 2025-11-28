const logger = require('./logger');

const delay = (ms = 0) => {
  const msgLocation = 'Helpers::util::delay()';
  let tiempoms = ms;

  if (process.env.DELAY_RANDOM_ENABLED === 'true') {
    let max = parseInt(process.env.DELAY_MAX, 10);
    let min = parseInt(process.env.DELAY_MIN, 10);
    tiempoms = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  logger.debug(`Tiempo espera: ${tiempoms} ms`, msgLocation);

  return new Promise((resolve) => {
    setTimeout(resolve, tiempoms);
  });
};

module.exports = {
  delay,
};
