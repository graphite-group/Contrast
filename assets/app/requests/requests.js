module.exports = function(app, socket){
  app
    .controller('requestCtrl',['$scope', function($scope){

      socket.getAsync("/requests")
      .then(function(response){
        if(!!response.data){
          $scope.requests = response.data.map(function(data){
            return {
              id : data._id,
              challengerImage : data.challengerImage,
              //challengerId : data.challengerImageId,
              opponentImage : data.opponentImage,
              //opponentId : data.opponentImageId
            };
          });
          $scope.$apply();
        }else{

        }
      })
      .catch(console.log.bind(console));

      $scope.accept = function(id){
       $scope.requests.shift();  
        socket.postAsync('/acceptChallenge',{challengeId: id})
        .then(function(response){
        });
      };

      $scope.reject = function(id){
       $scope.requests.shift();  
        socket.postAsync('/rejectChallenge',{challengeId: id})
        .then(function(response){
          console.log("rejected", response);
        });
      };

    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('requests', {
          url: '/requests',
          templateUrl: '/app/requests/requests.html',
          controller: 'requestCtrl'
        });
    }]);

};