'use strict';
var Promise = require('bluebird');
var neo4j = require('node-neo4j');
var env = require('../../env.js');

var dbAddress = env.namNeo || env.localNeo;
var db = new neo4j(dbAddress);

db = Promise.promisifyAll(db);

module.exports = {

  addComment : function(userId, imageId, text, callback) {

    var a =
    db.cypherQueryAsync(
      'START user=node(' + userId + '), image=node(' + imageId + ') \n' +
      'CREATE UNIQUE (user)-[:COMMENTED]->(c:comment {text: "' + text + '", createdAt: ' + JSON.stringify(new Date()) + '})<-[:HAS_COMMENT]-(image) \n' +
      'RETURN c, user, image'
    )
    .then(function(result){return result.data[0];})
    .spread(function(comment, user, image){
      comment.user = user;
      comment.image = image;

      sails.io.sockets.emit('comment', {
        data: comment,
        id: comment._id,
        imageId: image._id,
        verb: 'create',
        createdAt: comment.createdAt,
        updatedAt: new Date()
      });

      return comment;
    });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  getComments: function(imageId, callback){
    var a =
    db.cypherQueryAsync(
      'START image=node(26758) \n' +
      'MATCH (u:user)-[:COMMENTED]->(c:comment)<-[:HAS_COMMENT]-(image) \n' +
      'RETURN c, u'
    )
    .then(function(result){return result.data;})
    .map(function(result){
      var comment = result[0];
      var user = result[1];
      comment.user = user;
      return comment;
    });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  }

};


//.then(console.log.bind(console));