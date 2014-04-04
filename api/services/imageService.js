'use strict';
var knox = require('knox');
var Promise = require('bluebird');

var client = knox.createClient({
  key: 's3 key here',
  secret: 's3 secret here',
  bucket: 'contrastio'
});

client = Promise.promisifyAll(client);

module.exports = {

  //takes a local file path, the file extension. And saves it to S3, and returns the URL
  uploadToS3: function(localImgPath, fileExtension, callback){
    var newFileName = 'contrast/' + Date.now().toString(36) + Math.random().toString().slice(2) + fileExtension + '';
    var a = client.putFileAsync(localImgPath, newFileName, {'x-amz-acl': 'public-read'})
              .then(function(reply){
                console.log('IMAGE UPLOADED TO S3: ', reply.client._httpMessage.url);
                return reply.client._httpMessage.url;
              });

    if(typeof callback === 'function'){
      a.then(callback.bind(this, null)).catch(callback);
    } else {
      return a;
    }
  },


  createImageDetails: function(imageData, callback){
    //imageData.userId
  },

  updateImageDetails: function(imageId, imageData, callback){

  },

  fetchImageDetails: function(imageId, callback){

  },

  fetchImageByUserId: function(userId, callback){

  },

  fetchImagesByFilter: function(filter, callback){

  }

};