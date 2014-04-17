module.exports = function(app, socket){
  'use strict';

  app
  .controller('homeCtrl', ['$scope', 'MainService', '$state', '$rootScope', function($scope, MainService, $state, $rootScope){


    $scope.listener = function(event){
      if(event.verb === 'create'){
        $scope.images.unshift(event.data);
        $scope.$apply();
      }
      if(event.verb === 'update'){
        for(var i = 0; i < $scope.images.length; i++){
          if($scope.images[i]._id === event.id){
            for(var key in event.data){
              $scope.images[i][key] = event.data[key];
            }
            $scope.$apply();
            break;
          }
        }
      }
    };

    $scope.removeListeners = function(){
      socket.off('image', $scope.listener);
    };

    $rootScope.$on('$stateChangeStart', function(a,b){
      console.log(b.name);
      if(b.name.indexOf('homescreen') === -1){
        $scope.removeListeners();
        console.log('done');
      }
    });
    socket.on('image', $scope.listener);

    $scope.init = function(){
      MainService.getImages()
      .then(function(images){
        $scope.images = images;
        $scope.$apply();
      });
    };
    $scope.showIt = function(evt, id){
      $scope.rect = evt.target.getClientRects()[0];
      $scope.rect.customClass = '';
      $scope.backTo = 'homescreen';
      $state.go('homescreen.imageDetails', {imageId: id});
    };
    $scope.init();
  }])
  .controller('imageDetailsCtrl', ['$scope', 'MainService', '$state', '$stateParams', '$rootScope', function($scope, MainService, $state, $stateParams, $rootScope){

    $scope.listener = function(event){
      if(event.verb === 'update'){
        if($stateParams.imageId === event.id){
          for(var key in event.data){
            $scope[key] = event.data[key];
          }
          $scope.$apply();
        }
      }
    };

    $scope.removeListeners = function(){
      socket.off('image', $scope.listener);
    };

    $rootScope.$on('$stateChangeStart', function(a,b){
      console.log(b.name);
      if(b.name.indexOf('imageDetails') === -1){
        $scope.removeListeners();
        console.log('done');
      }
    });

    socket.on('image', $scope.listener);

    $scope.isLoggedIn = false;
    $scope.imageId = parseInt($stateParams.imageId);
    socket.getAsync('/image/' + $stateParams.imageId)
    .then(function(response){
      if(!response.success){
        throw new Error('Route not found');
      }
      return response.data;
    })
    .then(function(data){
      $scope.image = data;
      $scope.rect = {
        top: 100,
        left: 60,
        width: window.innerWidth - 120,
        height: window.innerHeight - 160,
        opacity: 1,
        customClass: 'isactive'
      };
      $scope.resizeHandler = window.addEventListener('resize', function(){
        $scope.rect.width = window.innerWidth - 120;
        $scope.rect.height = window.innerHeight - 160;
        $scope.$apply();
      });
      $scope.$apply();
    });


    MainService.isLoggedIn().then(function(user){
      if(!!user.id){
        $scope.isLoggedIn = true;
        $scope.$apply();
      }
    });
    $scope.challenge = false;
    $scope.challengeNow = function(){
      $scope.challenge = !$scope.challenge;
    };

    $scope.quit = function(should){
      delete $scope.rect;
      window.removeEventListener('resize', $scope.resizeHandler);
      if(should){ $scope.$apply(); }
      setTimeout(function(){
        $state.go('^');
      }, 300);
    };
  }])
  .controller('myImagesCtrl', ['$scope', 'MainService', function($scope, MainService){
    console.log('Opponent Image is = ', $scope.$parent.imageId);
    MainService.isLoggedIn()
    .then(function(user){
      if(!user.id){
        $scope.$parent.challenge = false;
        $scope.apply();
        throw new Error('done!');
      } else {
        return user.id;
      }
    })
    .then(MainService.getImagesForUser)
    .filter(function(image){
      return image._id !== $scope.$parent.imageId;
    })
    .then(function(images){
      console.log('Images', images);
      $scope.images = images;
      $scope.$apply();
    })
    .catch(console.log.bind(console));

    $scope.createChallenge = function(id){
      socket.postAsync('/challenge', {
        challengerImageId: id,
        opponentImageId: $scope.$parent.imageId
      })
      .then(function(response){
        if(!response.success){
          throw new Error(response.reason);
        }
        setTimeout(function(){
          $scope.$parent.quit(true);
        }, 300);
      })
      .catch(window.alert);
    };

  }])
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
    .state('homescreen', {
      url: '/',
      templateUrl: '/app/home/home.html',
      controller: 'homeCtrl'
    })
    .state('homescreen.imageDetails', {
      url: 'imageDetails/:imageId',
      templateUrl: '/app/imageDetails/imageDetails.html',
      controller: 'imageDetailsCtrl'
    });
  }]);

};