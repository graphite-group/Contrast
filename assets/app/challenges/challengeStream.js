module.exports = function(app, socket){
  app
    .controller('challengeStream',['$scope', function($scope){


    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('/challenges', {
          url: '/'
        });
    }]);

};