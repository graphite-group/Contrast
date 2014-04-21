'use strict';
var Promise = require('bluebird');
var neo4j = require('node-neo4j');
var env = require('../../env.js');

var dbAddress = env.namNeo || env.localNeo;
var db = new neo4j(dbAddress);

db = Promise.promisifyAll(db);

module.exports = {

  addComment : function(userId, imageId, text) {

    return db.cypherQueryAsync(
      'START user=node(' + userId + '), image=node(' + imageId + ') \n' +
      'CREATE UNIQUE (user)-[:COMMENTED]->(c:comment)<-[:HAS_COMMENT]-(image) \n' +
      'RETURN user, comment, image'
    );

  }

};

// b.cypherQueryAsync(
//       'START user=node(), image=node() \n' +
//       'CREATE UNIQUE (user)-[:COMMENTED]->(c:comment)<-[:HAS_COMMENT]-(image) \n' +
//       'RETURN user, comment, image'
//     ).then(console.log.bind(console))