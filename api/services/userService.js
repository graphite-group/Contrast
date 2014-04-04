var promise = require('bluebird');
var neo4j = require('node-neo4j');
// db = new neo4j('http://username:password@domain:port');
var db = new neo4j('http://localhost:7474');

db = promise.promisifyAll(db);


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
    var a = db.insertNodeAsync({
      name: userData.name,
      email: userData.email,
      description: userData.description,
      stats: userData.stats
    }, ['user']);

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

//returns true if node is successfully updated --- false if it is not found
  updateUser: function(userId, updateData, callback){
    //first need to read node to get old properties
    var a = this.fetchUserById(userId)
    .then(function(node){

      for(var key in updateData){
        node[key] = updateData[key];
      }
      console.log(node);
      return node;
    })
    .then(function(node){
      return db.updateNodeAsync(node._id, node, function(err, updated){
        if(err){
          throw err;
        }
        return updated;
      });
    });

    //then extend with the new properties in updateData
    // var a = db.updateNodeAsync(userId, updateData);
    // if(typeof callback === 'function'){
    //   a.then(callback.bind(this.null)).catch(callback);
    // } else {
    //   return a;
    // }
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
    var a = db.deleteNodeAsync(userId);
    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },

  fetchUserByEmail: function(email, callback){
    // db.readNode();
  }

};
// var userDataTest = {
//   name: "adam",
//   email: "test@test.",
//   description: "My name is Rob and I like to party."
//   // stats: {"stars": 500}
// };

// module.exports.createUser(userDataTest, function(node){console.log(node);});
module.exports.fetchUserById(544).then(function(node){console.log(node);});
// module.exports.updateUser(544, {name:"harish"}).then(function(node){console.log("last Console Log",node);});
// module.exports.deleteUser(542).then(function(node){console.log(node);});