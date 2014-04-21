'use strict';
var neo4j = require('node-neo4j');
var Promise = require('bluebird');
var env = require('../../env.js');
var scheduler = require('./scheduler.js');
var util = require('util');

var dbAddress = env.namNeo || env.localNeo;
var db = new neo4j(dbAddress);

db = Promise.promisifyAll(db);

var emitChallengeUpdate = function(challengeId){
  //cypher query to get the challenger and opponent data to send down on the socket event
  db.cypherQueryAsync(
    "START challenge = node(" +challengeId+")\n" +
    "MATCH (challenger:user)-[:CREATED]->()-[:IS_CHALLENGER]->(ch)<-[:IS_OPPONENT]-()<-[:CREATED]-(opponent:user)\n" +
    "RETURN challenger, challenge, opponent, labels(challenge);"
  )
  .then(function(results){return results.data[0];})
  .spread(function(challenger, challenge, opponent, labels){
    challenge.challenger = challenger;
    challenge.opponent = opponent;
    challenge.labels = labels;

    sails.io.sockets.emit('challenge', {
      data: challenge,
      id: challenge._id,
      verb: 'update',
      createdAt: challenge.createdAt,
      updatedAt: new Date()
    });
  });

};


module.exports = {

  //RELATIONSHIPS: 'IS_CHALLENGER', 'IS_OPPONENT', 'VOTED_ON'
  //LABELS: 'requested', 'accepted', 'ended'

  //challengerImageId: num, challengeeImageId: num, challengeStats: objects
  createChallenge: function(challengerImageId, opponentImageId, challengeStats, callback){

    challengeStats.createdAt = new Date();
    challengeStats.challengerImageId = challengerImageId;
    challengeStats.challengerVote = 0;
    challengeStats.opponentImageId = opponentImageId;
    challengeStats.opponentVote = 0;

    var addThreeWayRelationship = function(challengerNode, opponentNode, node){
      if(!challengerNode._id || !opponentNode._id){
        throw new Error("challengerNode or opponentNode does not exist");
      }
      return Promise.all([
        db.insertRelationshipAsync(challengerNode._id, node._id, 'IS_CHALLENGER', {}),
        db.insertRelationshipAsync(opponentNode._id, node._id, 'IS_OPPONENT', {}),
        db.updateNodeByIdAsync(node._id, {
          challengerImage : challengerNode.url,
          opponentImage : opponentNode.url
        })
      ]);
    };

    //TODO: change order to first check images exist.
    //Try a Cypher Query to create Challenge Node AND Relationships all together.
    var a =
      db.insertNodeAsync(challengeStats, ['challenge', 'requested' ])
        .then(function(node){
          return Promise.all([
            db.readNodeAsync(challengerImageId),
            db.readNodeAsync(opponentImageId),
            node
          ]);
        })
        .spread(addThreeWayRelationship)
        .spread(function(challengerRelationship, opponentRelationship, node){

          db.cypherQueryAsync(
            "START challenge = node(" +node._id+")\n" +
            "MATCH (challenger:user)-[:CREATED]->()-[:IS_CHALLENGER]->(ch)<-[:IS_OPPONENT]-()<-[:CREATED]-(opponent:user)\n" +
            "RETURN challenger, challenge, opponent, labels(challenge);"
          )
          .then(function(results){return results.data[0];})
          .spread(function(challenger, challenge, opponent, labels){
            challenge.challenger = challenger;
            challenge.opponent = opponent;
            challenge.labels = labels;

            sails.io.sockets.emit('challenge', {
              data: challenge,
              id: node._id,
              verb: 'create',
              createdAt: node.createdAt,
              updatedAt: new Date()
            });
          });
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

    //TODO: Add test that id is indeed a challenge.
    var a =
      db.readNodeAsync(challengeId)
        .then(function(node){
          if(Object.keys(challengeStats).length === 0){
            return node;
          }
          //emit update event over socket
          emitChallengeUpdate(challengeId);

          return db.updateNodeByIdAsync(node._id, challengeStats);
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //challengeId: num, challengeStats: object{challengerVote, opponentVote, createdAt}, acceptOrEnd: string
  acceptChallenge: function(userId, challengeId, callback){

    var a =
      db.readLabelsAsync(challengeId)
        .then(function(labels){
          if( labels.indexOf('accepted') !== -1 || labels.indexOf('ended') !== -1 ){
            throw new Error("Challenge already accepted or ended");
          }
          return db.readNodeAsync(challengeId);
        })
        .then(function(node){
          return db.readRelationshipsOfNodeAsync(node.opponentImageId);
        })
        .filter(function(relationship){
          return relationship._start === userId;
        })
        .then(function(relationships){
          return relationships.length > 0;
        })
        .then(function(isUser){
          if(!isUser){
            throw new Error("user can not accept this challenge");
          }
          return db.replaceLabelsFromNodeAsync(challengeId, ['challenge', 'accepted']);
        })
        .then(function(flag){
          var challengeStats = {};
          challengeStats.startTime = new Date();
          challengeStats.endTime = new Date(Date.now().valueOf() + 3600000);
          scheduler.addJob(challengeId, challengeStats.endTime);

          //emit update event over socket
          emitChallengeUpdate(challengeId);

          return db.updateNodeByIdAsync(challengeId, challengeStats);
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  rejectChallenge: function(userId, challengeId, callback){
    var a =
      db.readLabelsAsync(challengeId)
        .then(function(labels){
          if( labels.indexOf('accepted') !== -1 || labels.indexOf('ended') !== -1 ){
            throw new Error("Challenge already accepted or ended");
          }
          return db.readNodeAsync(challengeId);
        })
        .then(function(node){
          return db.readRelationshipsOfNodeAsync(node.opponentImageId);
        })
        .filter(function(relationship){
          return relationship._start === userId;
        })
        .then(function(relationships){
          return relationships.length > 0;
        })
        .then(function(isUser){
          if(!isUser){
            throw new Error("user can not reject this challenge");
          }
          return db.replaceLabelsFromNodeAsync(challengeId, ['challenge', 'ended']);
        })
        .then(function(node){
          var challengeStats = {};
          challengeStats.startTime = new Date();
          challengeStats.endTime = challengeStats.startTime;

          //emit update event over socket
          emitChallengeUpdate(challengeId);

          return db.updateNodeByIdAsync(challengeId, challengeStats);
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  endChallenge: function(challengeId, callback){

    var a =
      db.readLabelsAsync(challengeId)
        .then(function(labels){
          if(labels.indexOf('ended') !== -1 ){
            throw new Error("Challenge already ended");
          }
          return db.replaceLabelsFromNodeAsync(challengeId, ['challenge', 'ended']);
        })
        .then(function(){
          return db.readNodeAsync(challengeId);
        })
        .then(function(node){
          if(node.challengerVote > node.opponentVote){
            return Promise.join(
              db.insertRelationshipAsync(node.challengerImageId, node._id, 'WINNER', {}),
              db.insertRelationshipAsync(node.opponentImageId, node._id, 'LOSER', {}),
              node
            );
          } else if(node.challengerVote < node.opponentVote) {
            return Promise.join(
              db.insertRelationshipAsync(node.opponentImageId, node._id, 'WINNER', {}),
              db.insertRelationshipAsync(node.challengerImageId, node._id, 'LOSER', {}),
              node
            );
          } else {
            return Promise.join(
              db.insertRelationshipAsync(node.opponentImageId, node._id, 'WINNER', {}),
              db.insertRelationshipAsync(node.challengerImageId, node._id, 'WINNER', {}),
              node,
              true
            );
          }
        })
        .spread(function(a, b, node, isTie){

          var q;
          if(isTie){
            q = db.cypherQueryAsync(
              "START challenge = node(" + node._id +")\n" +
              "MATCH (loser:user)-[:CREATED]->(image)-[:WINNER]->(challenge)<-[:WINNER]-(:image)<-[:CREATED]-(winner:user)\n" +
              "RETURN winner, challenge, loser;"
            );
          } else {
            q = db.cypherQueryAsync(
              "START challenge = node(" + node._id +")\n" +
              "MATCH (loser:user)-[:CREATED]->(image)-[:LOSER]->(challenge)<-[:WINNER]-(:image)<-[:CREATED]-(winner:user)\n" +
              "SET winner.points = winner.points+20\n" +
              "SET loser.points = loser.points-20\n" +
              "RETURN winner, challenge, loser;"
            );
          }
          
          q.then(function(results){return results.data[0];})
          .spread(function(winner, challenge, loser){
            challenge.winner = winner;
            challenge.loser = loser;
            challenge.labels = labels;

            sails.io.sockets.emit('challenge', {
              data: challenge,
              id: node._id,
              verb: 'update',
              createdAt: node.createdAt,
              updatedAt: new Date()
            });
          })
          .catch(console.log.bind(console));

          return node;
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //relationship should be either "IS_CHALLENGER" or "IS_OPPONENT", or neither
  findChallengesByUserHistory: function(userId, relationship, callback){
    if(Array.isArray(relationship)){
      relationship = relationship.map(function(str){return ':' + str}).join('');
    } else {
      relationship = ':' + relationship
    }

      var a =
        db.cypherQueryAsync(
          "START n=node("+userId+")\n" +
          "MATCH (n)-[:CREATED]->(:image)-["+relationship+"]->(m:challenge)\n" +
          "WITH m \n" +
          "MATCH (o:user)-[:CREATED]->(:image)-[:IS_OPPONENT]->(m)<-[:IS_CHALLENGER]-(:image)<-[:CREATED]-(c:user) \n" +
          "RETURN o,m,c;"
        )
        .then(function(results){
          return results.data;
        })
        .map(function(result){
          result[1].opponent = result[0];
          result[1].challenger = result[2];
          return result[1];
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },
  //find all challenges to be accepted/rejected by user
 //Start n=node(user_id)
 // Match (n)-->(:image)-[:IS_OPPONENT]->(m:requested) return m;

  findChallengesToBeAcceptedRejected: function(userId, callback){
    var a =
      db.cypherQueryAsync(
        "START n=node("+userId+")\n" +
        "MATCH (n)-->(:image)-[:IS_OPPONENT]->(m:requested)\n" +
        "RETURN m;"
      )
      .then(function(results){
        return results.data;
      });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  findChallengesToVoteOn: function(userId, callback){
    var a =
      db.cypherQueryAsync(
        "START u=node("+userId+")\n" +
        "MATCH (n:accepted)\n" +
        "WHERE NOT((n)-[:VOTED_ON]-(u))\n"+
        "RETURN n;"
      )
      .then(function(results){
        return results.data;
      });
      // .map(function(result))

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
          //emit update event over socket
          emitChallengeUpdate(challengeId);
          return db.insertRelationshipAsync(userId, node._id, 'VOTED_ON', {});
        });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  }

};



var createChallenge = module.exports.createChallenge;
// createChallenge(26763,26766,{}).then(function(node){
//   console.log(node);
// });

// setTimeout(function(){
//   createChallenge(26763,26766,{}).then(function(node){
//     console.log('================RESULT================',node);
//   });
// }, 5000);

// createChallenge(49,23,{}).then(function(node){
//   console.log(node);
// });
// createChallenge(48,24,{}).then(function(node){
//   console.log(node);

// });

// updateChallenge = module.exports.updateChallenge;
// // updateChallenge(118,{challengerVote:'9', opponentVote:'0'}, function(err,result){
// //   console.log("update challenge", result);
// // });

//signature: acceptChallenge(userId, challengeId, callback)
var acceptChallenge = module.exports.acceptChallenge;
// acceptChallenge(4,6712, function(err,result){
  // console.log("err",err);
  // console.log("result",result);
// });


var endChallenge = module.exports.endChallenge;
//endChallenge(6720).then(function(err){console.log(err);}).catch(function(err){console.log(err);});
//  function(err,result){
//   console.log("err: ",err, "result:", result);
// });

// setTimeout(function(){
//   challengeService.endChallenge(26769, function(err,result){
//     console.log('================ERROR================', err);
//     console.log('================RESULT================',result);
//   });  
// }, 5000);
// endChallenge(36, function(err,result){
//   console.log(err);
//   console.log(result);
// });

//  console.log('results', results);
// });

//var findChallengesToVoteOn = module.exports.findChallengesToVoteOn;
// findChallengesToVoteOn(2,function(err,results){
//  console.log('results', results);
// });

var findChallengesToBeAcceptedRejected = module.exports.findChallengesToBeAcceptedRejected;
// findChallengesToBeAcceptedRejected(4,function(err,results){
//  console.log("results", results);
// });

//addUserVote = module.exports.addUserVote;
// addUserVote(117, 120, 117, function(err,node){
//   console.log("node", node);
// });

// resolveChallenge = module.exports.resolveChallenge;
// resolveChallenge();

//Use to delete all nodes and relationships
/*
MATCH (n)
OPTIONAL MATCH (n)-[r]-()
DELETE n,r

//use to delete node and it's relationships
START n = node(32) MATCH n-[r]-() DELETE n, r

//use to delete node that doesn't have relationships
START n = node( 1920 )  DELETE n

//delete all nodes by type
match ()-[r]->(n:challenge)<-[s]-()
delete n,r,s

//find all challenges won by user
Start n=node(user_id)
Match (n)-->(:image)-[:WINNER]->(m:challenge) return m;

//find all challenges to be accepted/rejected by user
Start n=node(user_id)
Match (n)-->(:image)-[:IS_OPPONENT]->(m:requested) return m;

//change labels of nodes
Match (n:ended)
remove n: ended
set n: requested
return n


*/
