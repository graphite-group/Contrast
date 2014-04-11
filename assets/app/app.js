'use strict';

var rootSocket;

(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    console.log('Connecting to Sails.js...');
  }

  socket.on('connect', function socketConnected() {

    socket.on('message', function messageReceived(message) {
      console.log('New comet message received :: ', message);
    });

    console.log(
      'Socket is now connected and globally accessible as `socket`.\n' +
      'e.g. to send a GET request to Sails, try \n' +
      '`socket.get("/", function (response) ' +
      '{ console.log(response); })`'
    );

  });

  window.socket = socket;
  rootSocket = socket;

})( require('./../js/sails.io.js') );

var angular = require('angular');

var app =
  angular.module('contrast', [
    require('angular-ui-router')
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/');
  }]);

require('./MainService.js')(app, rootSocket);
require('./login/login.js')(app, rootSocket);


