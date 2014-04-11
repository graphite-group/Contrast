var Promise = require('bluebird');

module.exports = function(app, socket){
  app
    .service('MainService', ['$http', function($http){
      this.getImages = function(){
        return "YAY Images";
      };

      this.login = function(){
      };

      this.getUserById = function(userId){
        return new Promise(function(resolve, reject){
          try{
            socket.get('http://localhost:3000/profile/' + userId, function(response){
              resolve(response.data);
            });
          } catch(e){
            reject(e);
          }
        });
      };
    }]);
};