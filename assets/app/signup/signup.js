module.exports = function(app, socket){

  app
    .controller('signupController', ['$scope', 'MainService', function($scope, MainService){
      $scope.emailStatus = $scope.formData.email;
      $scope.test = "asdf";
      $scope.submit = function(){
        // formData = $scope.formData;
        if(!$scope.formData.email){
          $scope.emailStatus = "Please enter valid email";
        }else{
          socket.post("/signup",{email: $scope.formData.email, password: $scope.formData.password, json: 'true'}, function(response){
            if(response.data){
              console.log(response.data);
              
            }else{
              console.log(response.reason);
            }
          });
        }
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
