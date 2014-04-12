
module.exports = function(app, socket){
  app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
      .state('profile',{
        url: '/profile',///{id:[0-9]{1,}}',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'
      });
      // .state('profile.id', {
      //   url:'/{id:[0-9]{1,}}',
      //   templateUrl: '/app/profile/profile.html',
      //   controller: 'profileCtrl'
      // });
  }])
  .controller('profileCtrl', ['$scope', '$stateParams', '$state', 'MainService', 
    function($scope, $stateParams, $state, MainService){
    $scope.Hello = "World";
    $scope.profileId = $stateParams.id;

    $scope.getUser = function(userId){
      console.log(userId);
      MainService.getUserById(userId).then(function(user){
        $scope.user = user;
        $scope.$apply();
      }, function(err){
        console.log("couldn't get the user");
      });
    };
    
    MainService.isLoggedIn().then(function(user){
      console.dir(user);
      if(user.id){
      $scope.getUser(user.id);
      } else {
        $state.go('login');
      }
    }).catch(console.log.bind(console));

    console.log('after if block');

    $scope.getImages = function(){
      MainService.getImages().then(function(images){
        $scope.images = images;
        $scope.$apply();
      }, function(err){
        console.log('error retrieving images');
      });
    };
    $scope.getImages();
  }])
  .service();

  // function MainCtrl($state){
  // $state.transitionTo('profile.images');
  // }

};

// .config(['$stateProvider', function($stateProvider){
//   $stateProvider
//     .state('profile', {
//       url: '/profile',
//       template: "Welcome to the profile view"
//       // views:{
//       //   'accountData':{
//       //     // templateUrl:,
//       //     // controller: 
//       //   },
//       //   'stats':{},
//       //   'images':{}
//       // }
//     });
// }])

// .controller('ProfileCtrl', ['$scope', function($scope){

// }]);

// module.exports = profile;