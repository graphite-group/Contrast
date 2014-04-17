
module.exports = function(app, socket){
  app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
      .state('profileAbs', {
        url:'/profile',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('profileAbs.profile', {
        url: '',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'
      })
      .state('profileAbs.profile.imageDetails', {
        url: '/imageDetails/:imageId',
        templateUrl: '/app/imageDetails/imageDetails.html',
        controller: 'imageDetailsCtrl'
      })
      .state('profileAbs.id', {
        url:'/{id:[0-9]{1,}}',
        templateUrl: '/app/profile/profile.html',
        controller: 'profileCtrl'//'profileIdCtrl'
      })
      .state('profileAbs.id.imageDetails', {
        url: '/imageDetails/:imageId',
        templateUrl: '/app/imageDetails/imageDetails.html',
        controller: 'imageDetailsCtrl'
      });
  }])
  .controller('profileCtrl', ['$scope', '$stateParams', '$state', 'MainService', '$rootScope', function($scope, $stateParams, $state, MainService, $rootScope){

    $scope.listener = function(event){
      if(event.verb === 'create'){
        $scope.images.push(event.data);
      }
      console.log(event);
      if(event.verb === 'update'){
        if(parseInt($scope.profileId) === parseInt(event.id)){
          for(var key in event.data){
            $scope.user[key] = event.data[key];
          }
          $scope.$apply();
        }
      }
    };

    $scope.removeListeners = function(){
      socket.off('user', $scope.listener);
    };

    $rootScope.$on('$stateChangeStart', function(a,b){
      console.log(b.name);
      if(b.name.indexOf('profile') === -1){
        $scope.removeListeners();
        console.log('done');
      }
    });
    socket.on('user', $scope.listener);

    $scope.profileId = $stateParams.id;
    $scope.profileOwner = false;
    $scope.showIt = function(evt, id){
      $scope.rect = evt.target.getClientRects()[0];
      $scope.rect.customClass = '';

      if($state.is('profileAbs.profile')) {
        $state.go('profileAbs.profile.imageDetails', {imageId: id});
      } else if($state.is('profileAbs.id')) {
        $state.go('profileAbs.id.imageDetails', {imageId: id});
      }
    };

    $scope.getUser = function(userId){
     return MainService.getUserById(userId).then(function(user){
        $scope.user = user;
        $scope.$apply();
        return true;
      }, function(err){
        console.log("couldn't get the user");
        return false;
      });
    };

    $scope.getImages = function(userId){
      MainService.getImagesForUser(userId).then(function(images){
        $scope.images = images;
        $scope.$apply();
      }, function(err){
        console.log('error retrieving images');
      });
    };

    if($stateParams.id){
      $scope.getUser($stateParams.id).then(function(isUser){
        if(isUser){
          $scope.getImages();
        } else {
          $state.go('404');
        }
      });

    } else {
      MainService.isLoggedIn().then(function(user){
        if(user.id){
        $scope.getUser(user.id);
        $scope.getImages(user.id);
        $scope.profileOwner = true;
        } else {
          $state.go('login');
        }
      }).catch(console.log.bind(console));
    }
  }])
  .controller('accountDataCtrl', ['$scope', 'UserService', function($scope, UserService){
    $scope.updateUser = function(data){
      data.id = $scope.user._id;
      UserService.updateUser({updates: data})
      .then(function(data){
        $scope.$apply();
      })
      .catch(console.log.bind(console));
    };
  }])
  .service('UserService', function(){
    this.updateUser = function(userData){
      return socket.postAsync('/profile/update', userData)
      .then(function(res){
        if(res.success === false){
           throw new Error(res.reason);
         }
         return res.data;
      });
    };
  });

  // function MainCtrl($state){
  // $state.transitionTo('profile.images');
  // }

};