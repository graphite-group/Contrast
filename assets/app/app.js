'use strict';
var rootSocket;

var Promise = require('bluebird');

var promisify = function(func){
  return function(){
    var args = [].slice.call(arguments);
    var that = this;
    return new Promise(function(resolve, reject){
      try{
        func.apply(that, args.concat([function(){
          resolve.apply(that, arguments);
        }]));
      } catch(err){
        reject(err);
      }
    });
  };
};

var promisifyAll = function(obj){
  for(var key in obj){
    if(typeof obj[key] === 'function'){
      obj[key + 'Async'] = promisify(obj[key]);
    }
  }
  return obj;
};



(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  socket = promisifyAll(socket);

  if (typeof console !== 'undefined') {
    console.log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    socket.on('message', function messageReceived(message) {
      console.log('New comet message received :: ', message);
    });

    console.log(
      'Socket is now connected and globally accessible as `socket`.\n' +
      'e.g. to send a GET request to Sails, try \n\n' +
      'socket.get("/", console.log.bind(console))'
    );

  });

  window.socket = socket;
  rootSocket = socket;

})( require('./../js/sails.io.js') );

var angular = require('angular');
require('./../js/angular-file-upload.js')(angular);

var app =
  angular.module('contrast', [
    require('angular-ui-router'),
    'angularFileUpload'
  ])
  .config(['$urlRouterProvider', function($urlRouterProvider){
    $urlRouterProvider.otherwise('/');
  }]);

require('./home/home.js')(app, rootSocket);
require('./MainService.js')(app, rootSocket);
require('./login/login.js')(app, rootSocket);
require('./signup/signup.js')(app, rootSocket);
require('./profile/profile.js')(app, rootSocket);
require('./imageUploader/imageUploader.js')(app, rootSocket);


