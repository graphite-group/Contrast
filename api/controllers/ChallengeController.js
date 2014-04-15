'use strict';
var challengeService = require('../services/challengeService');


var serveError = function(res){
  return function(err){
    res.send({
      success: false,
      reason: err
    });
  };
};

var serveData = function(res){
  return function(data){
    res.send({
      success: true,
      data: data
    });
  };
};

module.exports = {
  /**
   * Action blueprints:
   *    `/challenge/image`
   */

  createChallenge:function(req,res){
    var challengerImageId = req.body.challengerImageId;
    var opponentImageId = req.body.opponentImageId;
    if(!challengerImageId || !opponentImageId){
      return serveError(res)("Challenger and Opponent IDs are needed.");
    }

    challengeService.createChallenge(challengerImageId, opponentImageId, {})
    .then(serveData(res))
    .catch(serveError(res));
  },

  acceptChallenge:function(req,res){
    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    if(!challengeId){
      return serveError(res)("Challenge ID is needed.");
    }

    challengeService.acceptChallenge(userId, challengeId, {})
    .then(serveData(res))
    .catch(serveError(res));

  },

  rejectChallenge:function(req,res){
    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    if(!challengeId){
      return serveError(res)("Challenge ID is needed.");
    }
    challengeService.rejectChallenge(userId, challengeId, {})
    .then(serveData(res))
    .then(function(){
      userService.removePoints(userId, 5);
    })
    .catch(serveError(res));
  },

  myChallenges: function (req, res) {
    var userId = req.session.user.id;

    challengeService.findChallengesByUserHistory(userId, [])
    .then(serveData(res))
    .catch(serveError(res));
  },


   //should return empty array if there are no challenges unconnected to user.id above, else should
   //return array of challenges
  serveChallenge:function(req,res){
    //look at cookies to serve next correct challenge

    var userId = req.session.user.id;

    challengeService.findChallengesToVoteOn(parseInt(userId))
    .then(serveData(res))
    .catch(serveError(res));
  },

  acceptReject:function(req,res){
    var userId = req.session.user.id;
    console.log(userId);

    challengeService.findChallengesToBeAcceptedRejected(parseInt(userId))
    .then(serveData(res))
    .catch(serveError(res));
  },

  castVote:function(req,res){

    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    var imageId = req.body.imageId;
    if(!challengeId || !imageId){
      return serveError(res)("Challenge and Image IDs is needed.");
    }

    challengeService.addUserVote(userId, challengeId, imageId)
    .then(serveData(res))
    .then(function(){
      userService.addPoints(userId, 1);
    })
    .catch(serveError(res));

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ChallengeController)
   */
  _config: {}
};

// //fake req data to test
// var req={session:{a:'a',user:{id:0}}, body:{challengeId:0,imageId:0}};
// req.session.user.id = 3;
// req.body.challengeId = 0;
// req.body.imageId = 1;

// //should return empty array if there are no challenges unconnected to user.id above, else should
// //return array of challenges
// var serveChallenge = module.exports.serveChallenge;
// //serveChallenge(req);

// var castVote = module.exports.castVote;
// //castVote(req);
