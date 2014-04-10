module.exports = function(app){

  app
    .controller('loginController', ['$scope', 'MainService', function($scope, MainService){
      $scope.test = MainService.getImages();
    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider.state('login',{
          url: '/login',
          templateUrl: '/app/login/login.html',
          controller: 'loginController'
        });
    }]);

};