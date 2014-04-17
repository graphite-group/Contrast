'use strict';

var Promise = require('bluebird');

var user;

module.exports = function(app, socket){

  user = socket.getAsync('/isLoggedIn').then(function(response){
    if(!!response.success){
      return response.data;
    }else{
      return {};
    }
  });

  app
    .service('authService', function(){
      this.onBlurEmail = function($scope){
        if(!$scope.formData.email){
          $scope.emailMsg = true;
          $scope.emailStatus = "Please enter valid email";
        }
      };
    })
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
        console.log('the route is:', '/user/' + id + '/images');
        return socket.getAsync('/user/' + id + '/images')
          .then(function(res){
            if(res.success === false){
              throw new Error(res.reason);
            }
            return res.data;
          });
      };

      this.login = function(userData){
        user = new Promise(function(resolve, reject){
          resolve({
            id : userData.id,
            email : userData.email,
            logInTime : new Date()
          });
        });
      };

      this.isLoggedIn = function(){
        return user;
      };

      this.logout = function(){
        user = new Promise(function(resolve, reject){
          resolve({});
        });
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