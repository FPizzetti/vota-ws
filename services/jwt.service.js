'use strict';

var jwt = require('jsonwebtoken');
var config = require('../config/env.config.json');
var q = require('q');
var log = require('../services/log.service');

function generateToken(data) {
    var user = Object.assign({}, data);
    delete user._id;
    delete user.password;
    log.trace('generating token with data', user);
    return jwt.sign(user, config.jwt.secret, {expiresIn: config.jwt.expires});
}

function verifyToken(token) {
    var deferred = q.defer();
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
        if (err) {
            deferred.reject(err);
        } else {
            delete decoded.iat;
            delete decoded.exp;
            deferred.resolve(decoded);
        }
    });
    return deferred.promise;
}

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken
};