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
      reason: err.toString()
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
    //console.log(req.files.image.path);
    if(!!req.files.image){

      var imagePath = req.files.image.path;
      var extention;

      if(!!mimeToExt[req.files.image.headers['content-type']]){
        extention = mimeToExt[req.files.image.headers['content-type']];
      } else {
        console.log(req.files.image.headers['content-type']);
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

    if(!imageDetails.url){
      return serveError(res)('no image URL on the post data');
    }

    imageService.createImageDetails(imageDetails, userId)
      .then(serveData(res))
      .catch(serveError(res));
  },

  getImages: function(req, res){
    return imageService.fetchImagesByFilter()
      .then(function(images){
        return images.sort(function(a, b){
          return (new Date(b.updatedAt)).valueOf() - (new Date(a.updatedAt)).valueOf();
        });
      })
      .then(serveData(res))
      .catch(serveError(res));
  },

  updateImage: function(req, res){
    if(!req.params.id){
      return serveError(res)('No image id provided');
    }
    imageService.fetchImageDetails(parseInt(req.params.id))
      .then(function(imageNode){
        if(imageNode.user._id !== req.session.user.id && imageNode.user._id !== req.session.user._id){
          throw new Error("You cannot modify someone else's image!");
        }
        return true;
      })
      .then(function(){
        return imageService.updateImageDetails(parseInt(req.params.id), req.body)
      })
      .then(serveData(res))
      .catch(serveError(res));
  },

  getImagesForUser: function(req, res){
    if(!req.params.id){
      return serveError(res)('No image id provided');
    }

    return imageService.fetchImageByUserId(req.params.id)
      .then(function(images){
        return images.sort(function(a, b){
          return (new Date(b.updatedAt)).valueOf() - (new Date(a.updatedAt)).valueOf();
        });
      })
      .then(serveData(res))
      .catch(serveError(res));
  },

  getImageDetails: function(req, res){
    if(!req.params.id){
      return serveError(res)('No image id provided');
    }

    imageService.fetchImageDetails(parseInt(req.params.id))
      .then(serveData(res))
      .catch(serveError(res));
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ImageController)
   */
  _config: {}


};
//module.exports.getImages().map(function(image){return image.updatedAt;}).then(console.log.bind(console)).catch(console.log.bind(console, 'Error'));