// Manual mock for @faker-js/faker to avoid ESM parsing issues in Jest
module.exports = {
  fakerES: {
    number: {
      int: ({ min = 1, max = 10 } = {}) => {
        // return a deterministic integer within range
        return Math.max(min, Math.min(max, 2));
      },
    },
    commerce: {
      price: ({ min = 1, max = 100 } = {}) => {
        // return a string price with two decimals
        return '12.34';
      },
      product: () => 'ProductoDemo',
    },
    string: {
      alphanumeric: (len = 5) => 'A1B2C'.slice(0, len),
    },
  },
};
