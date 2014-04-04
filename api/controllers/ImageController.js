'use strict';




module.exports = {

  upload: function(req, res){
    console.log(req.files.image.path);
    if(!!req.files.image){

      var imagePath = req.files.image.path;
      var extention = req.files.image.type === 'image/png'     ? '.png' :
                      req.files.image.type === 'image/jpeg'    ? '.jpg' :
                      req.files.image.type === 'image/tiff'    ? '.tiff':
                      req.files.image.type === 'image/svg+xml' ? '.svg' :
                      req.files.image.type === 'image/svg'     ? '.svg' :
                                                                 '.jpg' ;

      imageService.uploadToS3(imagePath, extention)
        .then(res.send.bind(res))
        .catch(function(err){
          console.log(err);
          res.send(err);
        });

    } else {
      res.send({
        success: false,
        reason: 'no file by the name "image"'
      });
    }

  },

  setPortfolioImage: function(req, res){
    //handling the post data for when user selects portfolio pic
  },

  getImageDetails: function(req, res){

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ImageController)
   */
  _config: {}


};
