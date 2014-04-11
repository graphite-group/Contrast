var Promise = require('bluebird');

module.exports = function(app, socket){
  app
    .service('MainService', ['$http', function($http){
      this.getImages = function(){
        return "YAY Images";
      };
      // this.getUserById = function(userId){
      //   return $http({
      //     method: 'GET',
      //     url: 'http://localhost:3000/profile/' + userId
      //   }).then(function(data){
      //     return data.data;
      //   });
      // };
      this.getUserById = function(userId){
        return new Promise(function(resolve, reject){
          try{
            socket.get('http://localhost:3000/profile/' + userId, function(response){
              console.log('response');
              resolve(response.data);
            });
          } catch(e){
            reject(e);
          }
        });
      };
    }]);
};