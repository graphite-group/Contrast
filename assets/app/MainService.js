module.exports = function(app){
  app
    .service('MainService', ['$http', function($http){
      this.getImages = function(){
        return "YAY Images"
      }
    }]);
};