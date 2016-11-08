'use strict';

var mongodb = require('mongodb');
var log = require('../services/log.service');
var config = require('../config/env.config.json');
var q = require('q');

var MongoClient = mongodb.MongoClient;

var url = config.db.url;

function UserDAO() {

    var self = this;

    self.authenticate = function (user) {
        var deferred = q.defer();
        MongoClient.connect(url, function (err, db) {
            if (err) {
                log.error('Unable to connect to the mongoDB server. Error:', err);
            } else {
                log.trace('Connection established to', url);
                var collection = db.collection('users');
                collection.find({
                    identification: user.identification,
                    password: user.password
                }).toArray(function (err, result) {
                    db.close();
                    if (err) {
                        log.error(err);
                        throw err;
                    } else if (result.length) {
                        log.trace('Found user:', result);
                        deferred.resolve(result[0]);
                    } else {
                        log.warn('no user found');
                        deferred.reject('no user found');
                    }
                });
            }
        });
        return deferred.promise;
    }
}
UserDAO.constructor = UserDAO;
module.exports = UserDAO;