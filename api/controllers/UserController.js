'use strict';

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

  profile: function(req,res){
    //req.session.user will tell you which user is logged in
    //req.params.id will tell you profile id
    // serve profile

    // if user is logged in
    if(!!req.session.user){
      var userId = req.session.user.id || req.session.user._id;
    }
    var profileId = req.params.id || userId;
    var selfProfile = (profileId === userId);

    userService.fetchUserById(profileId)
      .then(serveData(res))
      .catch(serveError(res));
  },

  userStats: function(req, res){
    //req.params.id will give user id
    //serve their stats
    var profileId = req.params.id;
    userService.fetchUserById(profileId)
      .then(serveData(res))
      .catch(serveError(res));
  },

  updateAccount: function(req, res){
    var updates = req.body.updates;
    var userId = updates.id;
    delete updates.id;
    userService.updateUser(userId, updates)
    .then(function(data){
      sails.io.sockets.emit('user', {
        data: data,
        verb: 'update',
        createdAt: data.createdAt,
        updatedAt: new Date(),
        id: data._id
      });
      return data;
    })
    .then(serveData(res))
    .catch(serveError(res));

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ImageController)
   */
  _config: {}


};
