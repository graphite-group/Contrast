module.exports = function(app, socket){
  app
    .controller('mychallengesCtrl',['$scope', function($scope){

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
        console.log(b.name);
        if(b.name.indexOf('homescreen') === -1){
          $scope.removeListeners();
          console.log('done');
        }
      });
      socket.on('challenge', $scope.listener);

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