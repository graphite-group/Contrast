
module.exports = function(app, socket){
  app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider.state('profile',{
        url: '/profile/:id',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'
      });
  }])
  .controller('profileCtrl', ['$scope', '$stateParams', 'MainService', 
    function($scope, $stateParams, MainService){
    $scope.Hello = "World";
    $scope.userId = $stateParams.id;
    $scope.getUser = function(userId){
      MainService.getUserById(userId).then(function(user){
        $scope.user = user;
        $scope.$apply();
      }, function(err){
        console.log("couldn't get the user");
      });
    };
    $scope.getUser($scope.userId);
  }])
  .service();

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