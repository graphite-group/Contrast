module.exports = function(app, socket){
  app
    .controller('challengeStream',['$scope', function($scope){
      
      socket.postAsync("/challenge",{challengerImageId: 28, opponentImageId: 124})
      .then(function(response){
        console.log("resposne", response);
        if(!!response.data){
          $scope.challenge = response.data;
        }else{
        
        }
      })
      .catch(console.log.bind(console));

      // socket.getAsync("/challenge")
      // .then(function(response){
      //   console.log("resposne", response);
      //   if(!!response.data){
      //     $scope.challenge = response.data;
      //   }else{
        
      //   }
      // })
      // .catch(console.log.bind(console));

    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('challenges', {
          url: '/challenges',
          templateUrl: '/app/challenges/challengeStream.html',
          controller: 'challengeStream'
        });
    }]);

};