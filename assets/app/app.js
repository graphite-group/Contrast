'use strict';

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




})( require('./../js/sails.io.js') );

var angular = require('angular');

var app = angular.module('contrast', [
  require('angular-ui-router')
  // require('./login/login.js')
  ]);


app.config(['$stateProvider',function($stateProvider){
  $stateProvider
  .state('login',{
    url: "/login",
    templateUrl: "app/login/login.html",
    controller: require('./login/login')
  });

}]);

// require('./home');

// /////home//////


//   require('angular').module("app.home", [require('angular-ui-router')])
//   .controller('ctrl', [...]);

//   require('./subctrl');

/*
window.app = angular.module('contrast', [
    require('angular-ui-router'),
  ]);
*/