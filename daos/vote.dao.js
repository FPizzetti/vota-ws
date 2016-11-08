'use strict';

var mongodb = require('mongodb');
var log = require('../services/log.service');
var config = require('../config/env.config.json');
var q = require('q');

var MongoClient = mongodb.MongoClient;

var url = config.db.url;

function VoteDAO() {

    var self = this;

    self.vote = function (user, vote) {
        log.trace('voting:', vote, ' for user', user);
        var deferred = q.defer();
        MongoClient.connect(url, function (err, db) {
            if (err) {
                log.error('Unable to connect to the mongoDB server. Error:', err);
            } else {
                log.trace('Connection established to', url);
                var collection = db.collection('already_voted');
                collection.find({
                    user_id: user.identification,
                    current_election: config.currentElection
                }).toArray(function (err, result) {
                    if (err) {
                        log.error('error verifying unique vote:', err);
                        throw err;
                    } else if (result.length) {
                        log.trace('Found user:', result[0]);
                        db.collection('votes').updateOne({_id: result[0].vote_id}, vote, function (err) {
                            if (err) {
                                log.error('error while updating vote');
                                deferred.reject(err);
                            } else {
                                log.trace('vote updated successfully');
                                deferred.resolve(result[0].vote_id);
                            }
                        });

                    } else {
                        var collection = db.collection('votes');
                        collection.insertOne(vote, function (err, result) {
                            if (err) {
                                log.error('error while inserting vote', err);
                                deferred.reject('error while inserting vote');
                            } else {
                                var collection = db.collection('already_voted');
                                collection.insertOne({
                                    user_id: user.identification,
                                    vote_id: result.insertedId,
                                    current_election: config.currentElection
                                }, function (err) {
                                    db.close();
                                    if (err) {
                                        log.error('error while inserting verification', err);
                                        deferred.reject('error while inserting verification');
                                    } else {
                                        log.info('Vote was inserted into collection with "_id":', result.insertedId);
                                        deferred.resolve(result.insertedId);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }
}
VoteDAO.constructor = VoteDAO;
module.exports = VoteDAO;