require('dotenv').config();
const TCPServer = require('./models/server');

let params = { port: process.env.PORT, host: process.env.HOST };

const miTCPServer = new TCPServer(params);
miTCPServer.start();

