module.exports = function(app, socket){

  app
    .controller('loginController', ['$scope', 'MainService', '$state', 'authService', function($scope, MainService, $state, authService){

      MainService.isLoggedIn().then(function(user){
        if(user.id){
          $state.go('profile');
        }
      }).catch(console.log.bind(console));

      $scope.formData = $scope.formData || {};
      
      $scope.onBlurEmail = function(){
        authService.onBlurEmail($scope);
      };

      $scope.submitForm = function(){
        socket.postAsync("/login",{email: $scope.formData.email, password: $scope.formData.password, json: 'true'})
        .then(function(response){
          if(!!response.data){
            MainService.login(response.data);
            $state.go('profile',response.data.id);
          }else{
            $scope.passwordStatus = response.reason;
            $scope.$apply();
          }
        })
        .catch(console.log.bind(console));
      };
    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('login',{
          url: '/login',
          templateUrl: '/app/login/login.html',
          controller: 'loginController'
        })
        .state('logout',{
          url: '/logout',
          controller: function(MainService){
            MainService.logout();

            socket.post("/logout",{json:true}, function(response){
              console.log("logout",response);
            });
          }
        });
    }]);
};


