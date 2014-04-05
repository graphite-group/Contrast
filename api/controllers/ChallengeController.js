/**
 * ChallengeController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
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
   
   //should return empty array if there are no challenges unconnected to user.id above, else should
   //return array of challenges
   serveChallenge:function(req,res){
    //look at cookies to serve next correct challenge
    
    var userId = req.session.user.id;

    challengeService.findChallengesToVoteOn(userId)
    .then(serveData(res))
    .catch(serveError(res));
   },

   castVote:function(req,res){

    var userId = req.session.user.id;
    var challengeId = req.body.challengeId;
    var imageId = req.body.imageId;

    challengeService.addUserVote(userId, challengeId, imageId)
    .then(serveData(res))
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
