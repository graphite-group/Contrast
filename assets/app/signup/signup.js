module.exports = function(app, socket){

  app
    .controller('signupController', ['$scope', 'MainService', '$state', function($scope, MainService, $state){
      $scope.formData = $scope.formData || {};

      $scope.onBlurEmail = function(){
        if(!$scope.formData.email){
          $scope.emailMsg = true;
          $scope.emailStatus = "Please enter valid email";
        }
      };
      $scope.onBlurConfirmPassword = function(){
        if($scope.formData.password !==  $scope.formData.confirmPassword){
          $scope.confirmPasswordMsg = true;
          $scope.confirmPasswordStatus = "Passwords do not match";
        }
      };

      $scope.submit = function(){
        socket.postAsync("/signup",{email: $scope.formData.email, password: $scope.formData.password, json: 'true'})
        .then(function(response){
          if(response.data){
            MainService.login(response.data);
            $scope.serverMsg = "User Created";
            $scope.$apply();
            $state.go('profile',response.data.id);
            
          }else{
            console.log(response.reason);
            $scope.serverMsg = response.reason;
            $scope.$apply();
          }
        })
        .catch(console.log.bind(console));
  
      };
    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider.state('signup',{
        url: '/signup',
        templateUrl: '/app/signup/signup.html',
        controller: 'signupController'
      });
    }]);
};
