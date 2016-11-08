'use strict';
var UserController = require('../controllers/user.controller'),
    userController = new UserController();

var VoteController = require('../controllers/vote.controller'),
    voteController = new VoteController();

var VoteMidlleware = require('../middlewares/vote.middleware'),
    voteMiddleware = new VoteMidlleware();

var UserMiddleware = require('../middlewares/user.middleware'),
    userMiddleware = new UserMiddleware();

function Routes(server) {

    /*
    send:http://localhost:8000/auth
     {
     "identification":"123",
     "password":"123"
     }

     */
    server.post('auth', [
        userMiddleware.verifyFields,
        userController.authenticate
    ]);
/*

 send your vote to: http://localhost:8000/votes?token=YOUR_TOKEN

 {
 "mayor_id":1,
 "councilman_id":1
 }

 */
    server.post('votes', [
        userMiddleware.verifyToken,
        voteMiddleware.verifyFields,
        voteMiddleware.verifyVote,
        voteController.vote
    ]);

}
Routes.constructor = Routes;
module.exports = Routes;
