  'use strict';
var knox = require('knox');
var Promise = require('bluebird');
var neo4j = require('node-neo4j');
var env = require('../../env.js');

var db = new neo4j('http://localhost:7474');
db = Promise.promisifyAll(db);

var client = knox.createClient({
  key: env.s3Key,
  secret: env.s3Secret,
  bucket: 'contrastio'
});

client = Promise.promisifyAll(client);

module.exports = {

  //takes a local file path, the file extension. And saves it to S3, and returns the URL
  uploadToS3: function(localImgPath, fileExtension, callback){
    var newFileName = 'contrast/' + Date.now().toString(36) + Math.random().toString().slice(2) + fileExtension + '';

    var a =
    client.putFileAsync(localImgPath, newFileName, {'x-amz-acl': 'public-read'})
      .then(function(reply){
        console.log('IMAGE UPLOADED TO S3: ', reply.client._httpMessage.url);
        return reply.client._httpMessage.url;
      });

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },


  createImageDetails: function(imageData, userId, callback){
    var a =
    db.readLabelsAsync(userId)
      .then(function(labels){
        if( Array.isArray(labels) && labels.indexOf('user') !== -1){
          return true;
        } else {
          throw new Error('Cannot find User with the id ' + userId);
        }
      })
      .then(function(){
        imageData.updatedAt = new Date();
        return db.insertNodeAsync(imageData, ['image']);
      })
      .then(function(imageNode){
        return Promise.all([
          db.insertRelationshipAsync(userId, imageNode._id, 'CREATED', {}),
          imageNode
        ]);
      })
      .spread(function(relationship, imageNode){
        return imageNode;
      });

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  updateImageDetails: function(imageId, imageData, callback){
    var a =
    db.readLabelsAsync(imageId)
      .then(function(labels){
        if( Array.isArray(labels) && labels.indexOf('image') !== -1){
          return true;
        } else {
          throw new Error('Cannot find User with the id ' + imageId);
        }
      })
      .then(function(){
        return db.readNodeAsync(imageId);
      })
      .then(function(node){
        for(var key in imageData){
          node[key] = imageData[key];
        }
        node.updatedAt = new Date();
        return db.updateNodeByIdAsync(imageId, node);
      });

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }

  },

  fetchImageDetails: function(imageId, callback){
    var a =
    db.readNodeAsync(imageId)
      .then(function(node){
        if(!node){
          throw new Error('Image not found!');
        }
        return Promise.join(
          db.readRelationshipsOfNodeAsync(imageId)
            .filter(function(relationship){
              return relationship._end === imageId && relationship._type === 'CREATED';
            })
            .map(function(relationship){
              return db.readNodeAsync(relationship._start);
            }),
          node
        );
      })
      .spread(function(creators, node){
        if(creators.length === 1){
          node.user = creators[0];
        } else {
          node.users = creators;
        }
        return node;
      });

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  fetchImageByUserId: function(userId, callback){
    var a =
    db.readRelationshipsOfNodeAsync(userId, {})
      .filter(function(relationship){
        return relationship._end !== userId && relationship._type === 'CREATED';
      })
      .map(function(relationship){
        return relationship._end;
      })
      .bind(this)
      .map(function(imageId){
        return this.fetchImageDetails(imageId);
      });

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  fetchImagesByFilter: function(filter, callback){
    var a;
    if(filter === undefined || (Object.keys(filter)).length === 0){
      a = db.readNodesWithLabelAsync('image');
    } else {
      a = db.readNodesWithLabelsAndPropertiesAsync('image', filter);
    }

    // call callback or return promise
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  }

};

// module.exports.updateImageDetails(14, {updatedAt: new Date()}).then(console.log.bind(console)).catch(console.log.bind(console, 'Error'));