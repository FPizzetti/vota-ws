'use strict';

var jwtService = require('../services/jwt.service');
var log = require('../services/log.service');

function UserMiddleware() {

    var self = this;

    self.verifyFields = function (req, res, next) {

        var user = req.body;
        if (!user) {
            log.trace('invalid auth request, missing body');
            res.send(400, {error: 'missing body request'});
        }
        log.trace('auth request with body', user);
        var messages = [];
        if (!user.identification) {
            messages.push('missing identification in request');
        }
        if (!user.password) {
            messages.push('missing password in request');
        }

        if (messages.length) {
            log.trace('invalid auth request, errors:', messages);
            res.send(400, {errors: messages});
        } else {
            log.trace('calling auth controller');
            next();
        }
    };

    self.verifyToken = function (req, res, next) {
        var token = req.params.token;
        if (!token) {
            log.warn('missing token in request');
            return res.send(400, {error: 'missing token in request'});
        } else {
            jwtService.verifyToken(token).then(function (data) {
                log.trace('token decoded with data', data);
                req.jwt = data;
                next();
            }, function (err) {
                log.trace('error while decoding token', err);
                return res.send(400, {error: 'invalid token'});
            });
        }
    };
}
UserMiddleware.constructor = UserMiddleware;
module.exports = UserMiddleware;

