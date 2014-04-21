'use strict';
var Promise = require('bluebird');
var neo4j = require('node-neo4j');
var bcryptjs = require('bcryptjs');
var env = require('../../env.js');

var dbAddress = env.namNeo || env.localNeo;
var db = new neo4j(dbAddress);

db = Promise.promisifyAll(db);
bcryptjs = Promise.promisifyAll(bcryptjs);


/*
user node = {
  name (first and last),
  email,
  description(bio),
  stats: {}
}
*/

module.exports = {
  createUser: function(userData, callback){
    userData.joinDate = new Date();
    userData.createdAt = new Date();
    userData.points = 100;
    userData.wins = 0;
    userData.losses = 0;


    var a = //db.readNodesWithLabelsAndPropertiesAsync('user', {email:userData.email})
    db.cypherQueryAsync(
      "MATCH (n:user)\n" +
      "WHERE n.username ='"+userData.username+"' or n.email='"+userData.email+"'\n" +
      "RETURN n"
    )
    .then(function(nodes){
      if(nodes.data.length < 1){
        return module.exports.hashPassword(userData.password)
        .then(function(hash){
          userData.password = hash;
          return userData;
        })
        .then(function(userData){
          return db.insertNodeAsync(userData, ['user']);
        });
        // return db.insertNodeAsync(userData, ['user']);
      } else {
        //console.log(nodes.data);
        nodes.data.forEach(function(node){
          if(node.email === userData.email){
            throw new Error("An account with email " + userData.email +" already exists.");
          }else if(node.username === userData.username){
            throw new Error("An account with username " + userData.username +" already exists.");
          }
        });
      }
    });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

//returns true if node is successfully updated --- false if it is not found
  updateUser: function(userId, updateData, callback){
    var a = db.updateNodeByIdAsync(userId, updateData);

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  fetchUserById: function(userId, callback){
    var a = db.readLabelsAsync(userId)
    .filter(function(label){
      if(label === 'user'){
        return true;
      }
      return false;
    })
    .then(function(filteredItems){
      if(filteredItems.length === 0){
        throw new Error('user not found for that id');
      }
      return db.readNodeAsync(userId);
    })
    .then(function(node){
      delete node.password;
      return node;
    });
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

//returns true if node is successfully deleted --- false if it is not found
  deleteUser: function(userId, callback){
    //TODO: fix this so that it deletes all relationships of a user before deleting user

    // var a = db.deleteNodeAsync(userId);
    // if(typeof callback === 'function'){
    //   a.then(callback.bind(this, null)).catch(callback);
    // } else {
    //   return a;
    // }
  },

  fetchUserByEmail: function(email, callback){
    //readNodesWithLabelsAndProperties returns an array of all nodes that match
    var a = db.readNodesWithLabelsAndPropertiesAsync('user', {email:email});
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  validatePassword: function(password, hash, callback){
    var a = bcryptjs.compareAsync(password, hash);
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  hashPassword: function(password, callback){
    var a = bcryptjs.hashAsync(password, 8);
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  addPoints: function(userId, incPoints){
    var a = db.readLabelsAsync(userId)
    .filter(function(label){
      if(label === 'user'){
        return true;
      }
      return false;
    })
    .then(function(filteredItems){
      if(filteredItems.length === 0){
        throw new Error('user not found for that id');
      }
      return db.readNodeAsync(userId);
    })
    .then(function(node){
      var updatedPoints = node.points + incPoints;
      return db.updateNodeByIdAsync(userId, {points: parseInt(updatedPoints)}); //
    });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  removePoints: function(userId, incPoints){
    this.addPoints(userId, -1 * parseInt(incPoints));
  }

};