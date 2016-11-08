'use strict';

var log = require('../services/log.service');
var request = require('request-promise');
var config = require('../config/env.config.json');
var q = require('q');

var candidates;

function VoteMiddleware() {

    var self = this;

    self.verifyFields = function (req, res, next) {

        var vote = req.body;
        if (!vote) {
            log.trace('invalid vote request, missing body');
            res.send(400, {error: 'missing body in request'});
        }
        var messages = [];
        if (vote.councilman_id === undefined) {
            messages.push('missing councilman vote with an id in request');
        }
        if (vote.mayor_id === undefined) {
            messages.push('missing mayor vote with an id in request');
        }

        if (messages.length) {
            res.send(400, {errors: messages})
        } else {
            next();
        }
    };

    self.verifyVote = function (req, res, next) {

        var vote = req.body;

        var optionsCouncilman = {
            uri: config.candidates.councilman,
            json: true
        };

        var optionsMayor = {
            uri: config.candidates.mayor,
            json: true
        };

        var promises = [request(optionsCouncilman), request(optionsMayor)];

        if (!candidates) {
            q.all(promises).then(function (data) {
                candidates = data;
                log.trace('candidates found, councilman:', data[0].vereador.length, 'mayor:', data[1].prefeito.length);
                var isValidCouncilman = false;
                var isValidMayor = false;
                for (var councilman in data[0].vereador) {
                    if (vote.councilman_id == data[0].vereador[councilman].id) {
                        isValidCouncilman = true;
                        break;
                    }
                }
                for (var mayor in data[1].prefeito) {
                    if (vote.mayor_id == data[1].prefeito[mayor].id) {
                        isValidMayor = true;
                        break;
                    }
                }

                var messages = [];

                if (!isValidCouncilman && vote.councilman_id != null) {
                    messages.push('invalid councilman');
                }
                if (!isValidMayor && vote.mayor_id != null) {
                    messages.push('invalid mayor');
                }

                if (messages.length) {
                    res.send(400, {errors: messages});
                } else {
                    next();
                }
            }).catch(function (err) {
                log.err('error while validating candidates:', err);
                res.send(400, {error: 'error while validating candidates'});
            });
        } else {
            log.trace('candidates got from cache, councilman:', candidates[0].vereador.length, 'mayor:', candidates[1].prefeito.length);
            var isValidCouncilman = false;
            var isValidMayor = false;
            for (var councilman in candidates[0].vereador) {
                if (vote.councilman_id == candidates[0].vereador[councilman].id) {
                    isValidCouncilman = true;
                    break;
                }
            }
            for (var mayor in candidates[1].prefeito) {
                if (vote.mayor_id == candidates[1].prefeito[mayor].id) {
                    isValidMayor = true;
                    break;
                }
            }

            var messages = [];

            if (!isValidCouncilman && vote.councilman_id != null) {
                messages.push('invalid councilman');
            }
            if (!isValidMayor && vote.mayor_id != null) {
                messages.push('invalid mayor');
            }

            if (messages.length) {
                res.send(400, {errors: messages});
            } else {
                next();
            }
        }
    };
}
VoteMiddleware.constructor = VoteMiddleware;
module.exports = VoteMiddleware;

