/**
 *
 */

module.exports = {

  profile: function(req,res){
    //req.session.user will tell you which user is logged in
    //req.params.id will tell you profile id
    // serve profile
  },

  userStats: function(req,res){
    //req.params.id will give user id
    //serve their stats
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ImageController)
   */
  _config: {}


};
