module.exports = function(app, socket){
  app
    .controller('mychallengesCtrl',['$scope', function($scope){

      socket.getAsync("/mychallenges")
      .then(function(response){
        if(!!response.data){
          $scope.challenges = response.data.map(function(data){
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


    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('mychallenges', {
          url: '/mychallenges',
          templateUrl: '/app/mychallenges/mychallenges.html',
          controller: 'mychallengesCtrl'
        });
    }]);

};