'use strict';

module.exports = function(app, socket){

  app
    .controller('notificationCtrl', ['$scope', 'MainService', function($scope, MainService){
      
      $scope.listener = function(event){
        if(event.verb === 'create'){
          // $scope.images.push(event.data);
        }
        // console.log(event);
        if(event.verb === 'update'){
          var ended = event.data.labels.indexOf('ended') !== -1;
          var opponentId = parseFloat(event.data.opponent._id);
          var challengerId = parseFloat(event.data.challenger._id);
          
          // console.log('==========mainNotificationCtrl update happening===========', event.data);
          
          //get the logged in user via promise from main service
          if(ended){
            MainService.isLoggedIn().then(function(user){
              var curUserId = parseFloat(user.id);

              console.log('scope profile id fireing', curUserId);
              if(curUserId === opponentId && curUserId === challengerId){
                
                console.log('you are both the challenger and the opponent');

              } else if(curUserId === opponentId){

                console.log('you are the opponent');

              } else if(curUserId === challengerId){

                console.log('you are the challenger');

              }
            });

          }
        //   if(parseInt($scope.profileId) === parseInt(event.id)){
        //     for(var key in event.data){
        //       $scope.user[key] = event.data[key];
        //     }
        //     $scope.$apply();
        //   }
        }
      };

      socket.on('challenge', $scope.listener);
    }]);
};