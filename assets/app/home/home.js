module.exports = function(app, socket){
  'use strict';

  app
  .controller('homeCtrl', ['$scope', function($scope){

    $scope.init = function(){
      $scope.images = [];
      var names = ['alpha', 'beta', 'gamma', 'great', 'apple', 'boring'];
      for(var i = 0; i < 50; i++){
        $scope.images.push({
          name: names[Math.floor(Math.random() * 6)]
        });
      }
    };
    $scope.init();
  }])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider.state('home', {
      url: '/',
      templateUrl: '/app/home/home.html',
      controller: 'homeCtrl'
    });
  }]);

};