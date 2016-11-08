/**
 * Created by felip on 06/11/2016.
 */
'use strict';
var restify = require('restify'),
    Routes = require('./config/routes.config'),
    config = require('./config/env.config');

var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.queryParser());

new Routes(server);

server.listen(config.port, function () {
    console.log('listening at port %s', config.port);
});