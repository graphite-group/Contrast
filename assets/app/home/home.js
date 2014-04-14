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
    $scope.showIt = function(evt, id){
      $scope.rect = evt.target.getClientRects()[0];
      $scope.rect.customClass = '';
      $scope.backTo = 'homescreen';
      $state.go('homescreen.imageDetails', {imageId: id});
    };
    $scope.init();
  }])
  .controller('imageDetailsCtrl', ['$scope', 'MainService', '$state', '$stateParams', function($scope, MainService, $state, $stateParams){

    socket.getAsync('/image/' + $stateParams.imageId)
    .then(function(response){
      if(!response.success){
        throw new Error('Route not found');
      }
      return response.data;
    })
    .then(function(data){
      $scope.image = data;
      $scope.rect = {
        top: 100,
        left: 60,
        width: window.innerWidth - 120,
        height: window.innerHeight - 160,
        opacity: 1,
        customClass: 'isactive'
      };
      $scope.resizeHandler = window.addEventListener('resize', function(){
        $scope.rect.width = window.innerWidth - 120;
        $scope.rect.height = window.innerHeight - 160;
        $scope.$apply();
      });
      $scope.$apply();
    });
    $scope.quit = function(backTo){
      console.log("BACKTO:", backTo);
      delete $scope.rect;
      window.removeEventListener('resize', $scope.resizeHandler);
      setTimeout(function(){
        $state.go('^');
      }, 300);
    };
  }])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
    .state('homescreen', {
      url: '/',
      templateUrl: '/app/home/home.html',
      controller: 'homeCtrl'
    })
    .state('homescreen.imageDetails', {
      url: 'imageDetails/:imageId',
      templateUrl: '/app/imageDetails/imageDetails.html',
      controller: 'imageDetailsCtrl'
    });
  }]);

};