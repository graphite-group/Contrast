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
              challengerId : data.challengerImageId,
              opponentImage : data.opponentImage,
              opponentId : data.opponentImageId
            };
          });
          $scope.$apply();
        }else{

        }
      })
      .catch(console.log.bind(console));

      $scope.vote = function(id, imageId){
       $scope.challenges.shift();  
        socket.postAsync('/castVote',{challengeId: id, imageId:imageId})
        .then(function(response){
          console.log("vote", response);
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