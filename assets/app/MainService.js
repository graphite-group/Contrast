'use strict';

module.exports = function(app, socket){
  app
    .service('MainService', ['$http', function($http){
      this.getImages = function(){
        return 'YAY Images';
      };

      this.login = function(){
      };

      this.getUserById = function(userId){
        return socket.getAsync('http://localhost:3000/profile/' + userId)
          .then(function(res){return res.data});
      };
    }]);
};