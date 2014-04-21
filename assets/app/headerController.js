'use strict';

module.exports = function(app, socket){

  app
    .controller('headerCtrl', ['$scope', '$state', 'MainService', function($scope, $state, MainService){
      $scope.notification = {};
      $scope.isNotifications = false;
      $scope.hello = 'world';

      $scope.leaveNotification = function(){
        $scope.isNotifications = false;
        $state.go($scope.notification.target);
      };

      $scope.listener = function(event){
        if(event.verb === 'create'){
          var requested = event.data.labels.indexOf('requested') !== -1;
  
          if(requested){
            opponentId = parseFloat(event.data.opponent._id);
            challengerId = parseFloat(event.data.challenger._id);

            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);
              if(curUserId === opponentId){
                $scope.notification.text = 'You just received a challenge request.';
                $scope.notification.target = 'requests';
                $scope.isNotifications = true;
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
              if(curUserId === challengerId ){
                $scope.notification.text = 'An opponent has accepted your challenge.';
                $scope.notification.target = 'mychallenges';
                $scope.isNotifications = true;
              }
              $scope.$apply();
            });
          } else if(rejected){
            opponentId = parseFloat(event.data.opponent._id);
            challengerId = parseFloat(event.data.challenger._id);

            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);
              if(curUserId === challengerId ){
                $scope.notification.text = 'An opponent has rejected your challenge.';
                $scope.notification.target = 'mychallenges';
                $scope.isNotifications = true;
              }
              $scope.$apply();
            });

          } else if(ended){
            winnerId = parseFloat(event.data.winner._id);
            loserId = parseFloat(event.data.loser._id);
            
            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);

              if((curUserId === winnerId || curUserId === loserId)){
                $scope.notification.text = 'One of you challenges has just ended.';
                $scope.notification.target = 'mychallenges';
                $scope.isNotifications = true;
              }
              $scope.$apply();
            });
          }
        }
      };

      socket.on('challenge', $scope.listener);
    }]);
};