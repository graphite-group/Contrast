'use strict';
var neo4j = require('node-neo4j');
var Promise = require('bluebird');

var db = new neo4j('http://localhost:7474');
db = Promise.promisifyAll(db);


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
      return Promise.all([
        db.insertRelationshipAsync(challengerNode._id, node._id, 'IS_CHALLENGER', {}),
        db.insertRelationshipAsync(opponentNode._id, node._id, 'IS_OPPONENT', {}),
        node
      ]);
    };

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
          if(Object.keys(challengeStats).length === 0){
            return node;
          }
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
        .then(function(node){
          var challengeStats = {};
          challengeStats.startTime = new Date();
          challengeStats.endTime = new Date(Date.now().valueOf() + 3600000);
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

    var a =
      db.readRelationshipsOfNodeAsync(userId, {types: ['created']})
      .filter(function(link){
        return link._start === userId;
      })
      .map(function(link){
        return link._end;
      })
      .map(function(imageId){
        return db.readRelationshipsOfNodeAsync(imageId, {types: relationship})
          .filter(function(link){
            return link._start === imageId;
          })
          .map(function(link){
            return link._end;
          });
      })
      .reduce(function(total, collection){
        return total.concat(collection);
      }, [])
      .map(function(challengeId){
        return Promise.all([
            db.readNodeAsync(challengeId),
            db.readLabelsAsync(challengeId)
        ])
        .spread(function(node, labels){
          node.labels = labels;
          return node;
        });
      });


    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }
  },

  //relationship should be either "IS_CHALLENGER" or "IS_OPPONENT"
  findChallengesToVoteOn: function(userId, callback){
    var a =
      db.cypherQueryAsync(
        "START u=node("+userId+")\n" +
        "MATCH (n:accepted)\n" +
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
/* data to get started:
create (n:user {username:"stash"});
create (n:user {username:"norm"});
create (n:user {username:"harry"});
create (n:image {url:"xxxxx"});
create (n:image {url:"adsf"});
start n=node(13), m=node(14) create (n)-[r:created]->(m) return n;
start n=node(12), m=node(15) create (n)-[r:created]->(m) return n;
*/

var createChallenge = module.exports.createChallenge;
// createChallenge(15,14,{}).then(function(node){
//   console.log(node);
// });

// updateChallenge = module.exports.updateChallenge;
// // updateChallenge(118,{challengerVote:'9', opponentVote:'0'}, function(err,result){
// //   console.log(result);
// // });


// var acceptChallenge = module.exports.acceptChallenge;
// acceptChallenge(15,19, function(err,result){
//   console.log(err);
//   console.log(result);
// });

var endChallenge = module.exports.endChallenge;
// endChallenge(19, function(err,result){
//   console.log(err);
//   console.log(result);
// });


var findChallengesByUserHistory = module.exports.findChallengesByUserHistory;
findChallengesByUserHistory(12,"IS_OPPONENT",function(err,results){
 console.log(results);
});

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
