'use strict';

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

      this.login = function(){
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