/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var userService = require('../services/userService');
var Promise = require('bluebird');

module.exports = {

  login:function(req, res){
    //look up user
    //check password
    //set session id
    //set session.authenticated = true
    //set sessions
    var email = req.body.email;
    userService.fetchUserByEmail(email)
    .then(function(nodes){
      if(nodes.length>0){
        return node[0];
      } else {
        throw new Error('no user exists the given username/password');
      }
    })
    .then(function(node){
      //node is an array of all the nodes that match the given email
      return Promise.all([userService.validatePassword(req.body.password, node.password), node]);
    })
    .spread(function(isValid, node){
      if(isValid){
        delete node.password;
        req.session.user = node;
        req.session.user.id = node._id;
        req.session.authenticated = true;
        res.redirect('/home');
      } else {
        res.redirect('/login');
      }
    });
  },

  logout:function(req,res){
    req.session.loggedIn = false;
    res.redirect('/login');
  },

  signup:function(req,res){
    //get userData from req
    //userService.createUser
    //if success, res.send(node)
    //else return error
    var userData = req.body;
    userService.createUser(userData)
    .then(function(node){
      delete node.password;
      req.session.user = node;
      req.session.user.id = node._id;
      req.session.authenticated = true;
      res.redirect('/home');
    })
    .catch(function(err){
      console.log("error creating user: " + err);
      res.send(400, "unable to create user");
    });
  },

  removeAcct: function(req,res){
    //TODO: after the deleteUser function is fixed to delete relationships, hook this up

    // var userId = req.session.user.id;
    // userService.deleteUser(userId)
    // .then(function(success){
    //   if(success){
    //     res.send("user deleted successfully");
    //   } else {
    //     res.send(400, "user was not deleted");
    //   }
    // })
    // .catch(function(err){
    //   console.log("error deleting user: " + err);
    // });

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AuthController)
   */
  _config: {}


};

// var testReq = {
//   params: {email: 'encrypt@gmail.com', password: "adam"}
// };
// var testRes = {};
// module.exports.login(testReq, testRes);
