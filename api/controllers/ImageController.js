'use strict';

var mimeToExt = {
  'image/png'     : '.png' ,
  'image/jpeg'    : '.jpg' ,
  'image/tiff'    : '.tiff',
  'image/svg+xml' : '.svg' ,
  'image/svg'     : '.svg'
};

var serveError = function(res){
  return function(err){
    res.send({
      success: false,
      reason: err
    });
  };
};

var serveData = function(res){
  return function(data){
    res.send({
      success: true,
      data: data
    });
  };
};


module.exports = {

  upload: function(req, res){
    console.log(req.files.image.path);
    if(!!req.files.image){

      var imagePath = req.files.image.path;
      var extention;

      if(!!mimeToExt[req.files.image.type]){
        extention = mimeToExt[req.files.image.type];
      } else {
        return serveError(res)('the file is not an image');
      }

      imageService.uploadToS3(imagePath, extention)
        .then(function(url){ return {url: url} })
        .then(serveData(res))
        .catch(serveError(res));

    } else {
      return serveError(res)('no file by the name "image"');
    }

  },

  setPortfolioImage: function(req, res){
    var imageDetails = req.body;
    var userId = req.session.user.id || req.session.user._id;

    if(!!imageDetails.url){
      return serveError(res)('no file by the name "image"');
    }

    imageService.createImageDetails(imageDetails, userId)
      .then(serveData(res))
      .catch(serveError(res));
  },

  getImageDetails: function(req, res){
    if(!req.params.id){
      return serveError(res)('No image id provided');
    }

    imageService.fetchImageDetails(req.params.id)
      .then(serveData(res))
      .catch(serveError(res));
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ImageController)
   */
  _config: {}


};
