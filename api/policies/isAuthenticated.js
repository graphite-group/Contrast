/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.user && (req.session.user.id || req.session.user._id)) {
    req.session.user.id = req.session.user.id || req.session.user._id;
    console.log('session.user.id ', req.session.user.id);
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  if(req.wantsJSON){
    return res.send({
      success: false,
      reason: 'you need to be logged in to see this page'
    });
  }
  return res.forbidden('You are not permitted to perform this action.');

};
