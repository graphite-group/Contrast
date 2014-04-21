module.exports = function(app, socket){
  app
    .controller('mychallengesCtrl',['$scope', '$rootScope', function($scope, $rootScope){

      $scope.listener = function(event){
        if(event.verb === 'update'){
          for(var i = 0; i < $scope.images.length; i++){
            if($scope.challenges[i].id === event.id){
              for(var key in event.data){
                $scope.challenges[i][key] = event.data[key];
              }
              $scope.$apply();
              break;
            }
          }
        }
      };

      $scope.removeListeners = function(){
        socket.off('challenge', $scope.listener);
      };

      $rootScope.$on('$stateChangeStart', function(a,b){
        if(b.name.indexOf('mychallenges') === -1){
          $scope.removeListeners();
        }
      });
      socket.on('challenge', $scope.listener);

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
          $scope.$apply();
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