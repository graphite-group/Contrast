'use strict';

module.exports = function(app, socket){

  app
    .controller('headerCtrl', ['$scope', 'MainService', function($scope, MainService){
      $scope.notification = '';
      $scope.hello = 'world';

      $scope.listener = function(event){
        if(event.verb === 'create'){
          var requested = event.data.labels.indexOf('requested') !== -1;
  
          if(requested){
            opponentId = parseFloat(event.data.opponent._id);
            challengerId = parseFloat(event.data.challenger._id);

            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);
              if(curUserId === opponentId){
                $scope.notification = '<a href="#/requests">You just received a challenge request.</a>';
              }
              $scope.$apply();
            });
          }
        }

        if(event.verb === 'update'){
          var ended = event.data.labels.indexOf('ended') !== -1;
          var accepted = event.data.labels.indexOf('accepted') !== -1;
          var rejected = event.data.labels.indexOf('rejected') !== -1;
          var opponentId, challengerId, winnerId, loserId; 

          if(accepted){
            opponentId = parseFloat(event.data.opponent._id);
            challengerId = parseFloat(event.data.challenger._id);

            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);
              if(curUserId === challengerId && !$scope.accepted){
                $scope.accepted = true;
                $scope.notification = '<a href="#/challenges">An opponent has accepted your challenge.</a>';
              }
              $scope.$apply();
            });
          } else if(rejected){
            opponentId = parseFloat(event.data.opponent._id);
            challengerId = parseFloat(event.data.challenger._id);

            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);
              if(curUserId === challengerId && !$scope.rejected){
                $scope.rejected = false;
                $scope.notification = '<a href="#/challenges">An opponent has rejected your challenge.</a>';
              }
              $scope.$apply();
            });

          } else if(ended){
            winnerId = parseFloat(event.data.winner._id);
            loserId = parseFloat(event.data.loser._id);
            
            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);

              if(!$scope.ended && (curUserId === winnerId || curUserId === loserId)){
                $scope.notification = '<a href="#/challenges">One of your challenges has just ended.</a>';
              }
              $scope.$apply();
            });
          }
        }
      };

      socket.on('challenge', $scope.listener);
    }]);
};