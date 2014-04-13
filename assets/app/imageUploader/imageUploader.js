module.exports = function(app, socket){

  app
    .controller('imageUploader', ['$scope', '$upload', 'MainService', '$state', function($scope, $upload, MainService, $state){
      
      $scope.imageUploadFinished = false;
      $scope.uploadingBar = false;


      $scope.onFileSelect = function($files) {
        $scope.uploadingBar = true;
        $scope.upload = $upload.upload({
          url: '/upload', 
          method: 'POST',
          data: {image: $files[0]}
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          $scope.imageUrl = data.data.url;
          $scope.imageUploadFinished = true;
          $scope.uploadingBar = false;
        }).catch(function(error){
          console.error(error);
        });
      };
      

      $scope.cancel = function(){
        console.log("cancelled");
        $state.go('profile');
      };

      $scope.submitForm = function(){
        socket.postAsync("/image",{url: $scope.imageUrl, title: $scope.imageUpload.title, description: $scope.imageUpload.description})
        .then(function(response){
          if(!response.success){
            throw new Error("Something went wrong, please try again");
          }
          console.log("imageUploadResponse",response);
          $state.go('profile');
        })
        .catch(function(err){
          $scope.errorMsg = err;
        });
       };
    }])
    .config(['$stateProvider', function($stateProvider){
      $stateProvider
        .state('imageUploader',{
          url: '/imageUploader',
          templateUrl: '/app/imageUploader/imageUploader.html',
          controller: 'imageUploader'
        });
    }]);
};


