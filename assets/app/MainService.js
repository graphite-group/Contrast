'use strict';

var user = {};

module.exports = function(app, socket){
  app
    .service('MainService', ['$http', function($http){
      this.getImages = function(){
        return 'YAY Images';
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
          .then(function(res){return res.data});
      };


    }]);
};