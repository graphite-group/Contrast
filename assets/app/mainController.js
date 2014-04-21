'use strict';

module.exports = function(app, socket){

  user = socket.getAsync('/isLoggedIn').then(function(response){
    if(!!response.success){
      return response.data;
    }else{
      return {};
    }
  });

  app
    .controller('mainController', ['$scope', function($scope){
      
    }]);
};