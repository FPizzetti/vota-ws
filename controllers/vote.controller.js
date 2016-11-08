'use strict';
var VoteDao = require('../daos/vote.dao'),
    voteDao = new VoteDao();

var log = require('../services/log.service');

function VoteController() {

    this.vote = function (req, res) {

        var vote = req.body;

        voteDao.vote(req.jwt, vote).then(function (data) {
            res.send(200, {
                identification: data,
                message: 'vote computed with success'
            });
        }, function (err) {
            log.error('error while trying to vote:', err);
            res.send(400, {error: err});
        });
    };
}
VoteController.constructor = VoteController;
module.exports = VoteController;

