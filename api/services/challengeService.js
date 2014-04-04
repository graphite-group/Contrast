var neo4j = require('node-neo4j');
var Promise = require('bluebird');

var db = new neo4j('http://localhost:7474');
db = Promise.promisifyAll(db);


module.exports = {
  //challengerImageId: num, challengeeImageId: num, challengeStats: object
  createChallenge: function(challengerImageId, challengeeImageId, challengeStats, callback){
    
    var jsonStats = JSON.stringify(challengeStats);

    var addThreeWayRelationship = function(challengerNode, challengeeNode, node){
      return Promise.all([
        db.insertRelationshipAsync(challengerNode._id, node._id, 'IS_CHALLENGER', {}),
        db.insertRelationshipAsync(challengeeNode._id, node._id, 'IS_CHALLENGEE', {}),
        node
      ]);
    };

    var a = db.insertNodeAsync({
      challengeStats: jsonStats
    }, ['challenge'])
      .then(function(node){
        return Promise.all([
          db.readNodeAsync(challengerImageId),
          db.readNodeAsync(challengeeImageId),
          node
        ]);
      })
      .spread(addThreeWayRelationship)
      .spread(function(challengerNode, challengeeNode, node){
        return node;
      });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    }else{
      return a;
    }

  },


  updateChallenge: function(challengeId, challengeStats, callback){

  },

  findChallengeByUserHistory: function(userId, callback){
  },

  addUserVote: function(userId, challengeId, callback){

//   db.readNode(71, function(err, node){
//     if(err) throw err;

//     // Output node properties.
//     console.log(node.name);

//     // Output node id.
//     console.log(node.age); /* for 2.0.0-RC6, use: console.log(node._id) */
// });

  // db.cypherQuery("MATCH (n) return n", function(err, result){
  //     if(err) throw err;

  //     console.log(result); // delivers an array of query results
  // });
  // },

  resolveChallenge: function(challengeId, callback){

  }

};

// findChallengeByUserHistory = module.exports.findChallengeByUserHistory;
// addUserVote = module.exports.addUserVote;
// createChallenge = module.exports.createChallenge;
// resolveChallenge = module.exports.resolveChallenge;
// updateChallenge = module.exports.updateChallenge;
// createChallenge(80,92,{a:'2',b:'4'}).then(function(node){
//   console.log(node);
// });
// addUserVote();
// createChallenge();
// resolveChallenge();
// updateChallenge();

