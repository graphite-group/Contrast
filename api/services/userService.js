var promise = require('bluebird');
var neo4j = require('node-neo4j');
var bcryptjs = require('bcryptjs');
// db = new neo4j('http://username:password@domain:port');
var db = new neo4j('http://localhost:7474');

db = promise.promisifyAll(db);
bcryptjs = promise.promisifyAll(bcryptjs);


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
    var a = db.readNodesWithLabelsAndPropertiesAsync('user', {email:userData.email})
    .then(function(nodes){
      if(nodes.length < 1){
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
        throw new Error("a user account for " + userData.email +" already exists.");
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
    var a = db.readNodeAsync(userId);
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
  }

};

/////////////////////////////////
//test bits
////////////////////////////////
// var userDataTest = {
//   name: "encrypted",
//   email: "encrypt@gmail.com",
//   description: "My name is Rod and I like to party.",
//   password: "adam"
// };

// module.exports.createUser(userDataTest);// function(err, node){console.log(err, node);});
// module.exports.fetchUserById(541).then(function(node){console.log(node);});
// module.exports.updateUser(541, {email: "testing@tests.com"}).then(function(node){console.log("last Console Log",node);});
// module.exports.deleteUser(542).then(function(node){console.log(node);});
// module.exports.fetchUserByEmail('bcrypt@gmail.com').then(function(node){console.log(node);});
// module.exports.hashPassword('whatsup').then(function(x){console.log(x);});//.catch(function(err){console.log(err);});
// module.exports.validatePassword("adam",{password:'$2a$08$LsNAS31.8Yd7GOS0BZIgHuzY5zTu15TnfSRe5hlNp3OpYBO7YFbhm'}).then(function(x){console.log(x);});