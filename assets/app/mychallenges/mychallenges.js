module.exports = function(app, socket){
  app
    .controller('mychallengesCtrl',['$scope', function($scope){

      socket.postAsync("/mychallenges",{relationship: "IS_CHALLENGER"})
      .then(function(response){
        if(!!response.data){
          $scope.challengers = response.data.map(function(data){
            return {
              id : data._id,
              challengerImage : data.challengerImage,
              challengerVote : data.challengerVote,
              opponentImage : data.opponentImage,
              opponentVote : data.opponentVote
            };
          });
          console.log("challenger",$scope.challengers);
          $scope.$apply();
        }else{

        }
      })
      .catch(console.log.bind(console));

      socket.postAsync("/mychallenges",{relationship: "IS_OPPONENT"})
      .then(function(response){
        if(!!response.data){
          $scope.opponents = response.data.map(function(data){
            return {
              id : data._id,
              challengerImage : data.challengerImage,
              challengerVote : data.challengerVote,
              opponentImage : data.opponentImage,
              opponentVote : data.opponentVote
            };
          });
          console.log("opponents",$scope.opponents);
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