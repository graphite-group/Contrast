
module.exports = function(app, socket){
  app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
      .state('profileAbs', {
        url:'/profile',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('profileAbs.profile',{
        url: '',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'
      })
      .state('profileAbs.id', {
        url:'/{id:[0-9]{1,}}',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'//'profileIdCtrl'
      });
  }])
  .controller('profileCtrl', ['$scope', '$stateParams', '$state', 'MainService',
    function($scope, $stateParams, $state, MainService){
    $scope.Hello = 'World';
    $scope.profileId = $stateParams.id;
    // console.log('stateParams: ', $stateParams);

    $scope.getUser = function(userId){
      MainService.getUserById(userId).then(function(user){
        $scope.user = user;
        $scope.$apply();
      }, function(err){
        console.log("couldn't get the user");
      });
    };

    $scope.getImages = function(userId){
      MainService.getImagesForUser(userId).then(function(images){
        $scope.images = images;
        $scope.$apply();
      }, function(err){
        console.log('error retrieving images');
      });
    };
    if($stateParams.id){
      $scope.getUser($stateParams.id);
      $scope.getImages($stateParams.id);
    } else {
      MainService.isLoggedIn().then(function(user){
        if(user.id){
        $scope.getUser(user.id);
        $scope.getImages(user.id);
        } else {
          $state.go('login');
        }
      }).catch(console.log.bind(console));
    }


  }]);
  // .service();

  // function MainCtrl($state){
  // $state.transitionTo('profile.images');
  // }

};