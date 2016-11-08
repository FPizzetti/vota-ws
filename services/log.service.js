'use strict';
const bunyan = require('bunyan');

module.exports = bunyan.createLogger({
    name: 'vota-ws',
    level: 10
});