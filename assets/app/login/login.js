module.exports = function(app, socket){

  app
    .controller('loginController', ['$scope', 'MainService', function($scope, MainService){
      //$scope.formData = {};
      $scope.submit = function(){
        // formData = $scope.formData;
        socket.post("/login",{email: $scope.formData.email, password: $scope.formData.password, json: 'true'}, function(response){
          if(response.data){
            console.log(response.data);
            
          }else{
            console.log(response.reason);
          }
        });
      };
    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider.state('login',{
        url: '/login',
        templateUrl: '/app/login/login.html',
        controller: 'loginController'
      });
    }]);
};


