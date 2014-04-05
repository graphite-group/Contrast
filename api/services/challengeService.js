'use strict';
var neo4j = require('node-neo4j');
var Promise = require('bluebird');

var db = new neo4j('http://localhost:7474');
db = Promise.promisifyAll(db);


module.exports = {

  //RELATIONSHIPS: 'IS_CHALLENGER', 'IS_OPPONENT', 'VOTED_ON'

  //challengerImageId: num, challengeeImageId: num, challengeStats: objects
  createChallenge: function(challengerImageId, opponentImageId, challengeStats, callback){

    challengeStats.createdAt = new Date();
    challengeStats.challengerImageId = challengerImageId;
    challengeStats.challengerVote = 0;
    challengeStats.opponentImageId = opponentImageId;
    challengeStats.opponentVote = 0;

    var addThreeWayRelationship = function(challengerNode, opponentNode, node){
      return Promise.all([
        db.insertRelationshipAsync(challengerNode._id, node._id, 'IS_CHALLENGER', {}),
        db.insertRelationshipAsync(opponentNode._id, node._id, 'IS_OPPONENT', {}),
        node
      ]);
    };

    var a =
      db.insertNodeAsync(challengeStats, ['challenge'])
        .then(function(node){
          return Promise.all([
            db.readNodeAsync(challengerImageId),
            db.readNodeAsync(opponentImageId),
            node
          ]);
        })
        .spread(addThreeWayRelationship)
        .spread(function(challengerNode, opponentNode, node){
          return node;
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //challengeId: num, challengeStats: object{challengerVote, opponentVote, createdAt}
  updateChallenge: function(challengeId, challengeStats, callback){
    var a =
      db.readNodeAsync(challengeId)
        .then(function(node){
          return db.updateNodeByIdAsync(node._id, challengeStats);
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //relationship should be either "IS_CHALLENGER" or "IS_OPPONENT"
  findChallengesByUserHistory: function(userId, relationship, callback){
    if(!Array.isArray(relationship)){
      relationship = [relationship];
    }
      console.log(relationship);

    var a =
      db.readRelationshipsOfNodeAsync(userId, {types: relationship});

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //relationship should be either "IS_CHALLENGER" or "IS_OPPONENT"
  findChallengesToVoteOn: function(userId, callback){
    console.log("CORRECT FUNC: ", userId);
    var a =
      db.cypherQueryAsync(
        "START u=node("+userId+")\n" +
        "MATCH (n:challenge)\n" +
        "WHERE NOT((n)-[]-(u))\n"+
        "RETURN n;"
      ).then(function(results){
        return results.data;
      });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  addUserVote: function(userId, challengeId, imageId, callback){
    var a =
      db.readNodeAsync(challengeId)
        .then(function(node){
          var challengeStats = {};
          if(node.challengerImageId === imageId){
            challengeStats.challengerVote = node.challengerVote + 1;
          }else if(node.opponentImageId === imageId){
            challengeStats.opponentVote = node.opponentVote + 1;
          }

          return db.updateNodeByIdAsync(node._id, challengeStats);
        }).then(function(node){
          return db.insertRelationshipAsync(userId, node._id, 'VOTED_ON', {});
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  }

};

//need to make nodes in browser before using these to test

//createChallenge = module.exports.createChallenge;
// createChallenge(2,1,{}).then(function(node){
//   console.log(node);
// });

// updateChallenge = module.exports.updateChallenge;
// // updateChallenge(118,{challengerVote:'9', opponentVote:'0'}, function(err,result){
// //   console.log(result);
// // });


// findChallengesByUserHistory = module.exports.findChallengesByUserHistory;
// // findChallengesByUserHistory(118,"IS_OPPONENT",function(err,results){
// //  console.log(results);
// // });

//findChallengesToVoteOn = module.exports.findChallengesToVoteOn;
// findChallengesToVoteOn(2,function(err,results){
//  console.log(results.data);
// });

//addUserVote = module.exports.addUserVote;
// addUserVote(117, 120, 117, function(err,node){
//   console.log(node);
// });

// resolveChallenge = module.exports.resolveChallenge;
// resolveChallenge();

//Use to delete all nodes and relationships
/*
MATCH (n)
OPTIONAL MATCH (n)-[r]-()
DELETE n,r
*/
