'use strict';

var user = {};

module.exports = function(app, socket){
  app
    .service('MainService', function(){
      this.getImages = function(){
        return socket.getAsync('/image')
          .then(function(res){
            if(res.success === false){
              throw new Error(res.reason);
            }
            return res.data;
          });
      };

      this.getImagesForUser = function(id){
        return socket.getAsync('/user/' + id + '/images')
          .then(function(res){
            if(res.success === false){
              throw new Error(res.reason);
            }
            return res.data;
          });
      };

      this.login = function(userData){
        user.id = userData.id;
        user.email = userData.email;
        user.logInTime = new Date();

        console.log("UserData", user);
      };

      this.isLoggedIn = function(){
        return !!user.id;
      };

      this.logout = function(){
        user = {};
      };

      this.getUserById = function(userId){
        return socket.getAsync('http://localhost:3000/profile/' + userId)
          .then(function(res){
            if(res.success === false){
              throw new Error(res.reason);
            }
            return res.data;
          });
      };
    });
};