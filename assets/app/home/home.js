module.exports = function(app, socket){
  'use strict';

  app
  .controller('homeCtrl', ['$scope', 'MainService', '$state', function($scope, MainService, $state){

    $scope.init = function(){
      MainService.getImages()
      .then(function(images){
        $scope.images = images;
        $scope.$apply();
      });
    };
    $scope.showIt = function(){
      $state.go('homescreen.imageDetails');
    };
    $scope.init();
  }])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
    .state('homescreen', {
      url: '/',
      templateUrl: '/app/home/home.html',
      controller: 'homeCtrl'
    })
    .state('homescreen.imageDetails', {
      url: 'imageDetails',
      templateUrl: '/app/imageDetails/imageDetails.html'
    });
  }]);

};