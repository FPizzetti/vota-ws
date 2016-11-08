'use strict';

var UserDao = require('../daos/user.dao'),
    userDao = new UserDao();

var tokenService = require('../services/jwt.service');
var log = require('../services/log.service');

function UserController() {

    this.authenticate = function (req, res) {

        var user = req.body;

        userDao.authenticate(user).then(function (data) {
            res.send(200, {token: tokenService.generateToken(data)});
        }, function () {
            res.send(403, {error: 'invalid credentials'});
        }).catch(function (err) {
            log.error(err);
            res.send(400, {error: 'error while connecting with database'});
        });
    };
}
UserController.constructor = UserController;
module.exports = UserController;

