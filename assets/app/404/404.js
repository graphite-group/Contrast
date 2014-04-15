module.exports = function(app, socket){
  app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
      .state('404', {
        url:'/404',
        templateUrl: '/app/404/404.html'
      });
  }]);
};