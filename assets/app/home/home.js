module.exports = function(app, socket){
  'use strict';

  app
  .controller('homeCtrl', ['$scope', 'MainService', function($scope, MainService){

    $scope.init = function(){
      MainService.getImages()
      .then(function(images){
        $scope.images = images;
        $scope.$apply();
      });
    };
    $scope.init();
  }])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider.state('home', {
      url: '/',
      templateUrl: '/app/home/home.html',
      controller: 'homeCtrl'
    });
    $stateProvider.state('imageDetails', {
      view: 'popup',
      url: '/imageDetails',
      templateUrl: '/app/imageDetails/imageDetails.html'
    });
  }]);

};