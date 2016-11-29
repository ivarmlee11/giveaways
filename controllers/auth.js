var express = require("express"),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    passport = require('../config/ppConfig');

router.get('/twitch', 
  passport.authenticate('twitchtv'));

router.get('/twitch/callback', 
  passport.authenticate('twitchtv',  { failureRedirect: '/' }), 
  function(req, res) {
  res.redirect('/auth/loggedIn');
});

router.get('/beam',
  passport.authenticate('beam'));

router.get('/beam/callback',
  passport.authenticate('beam', { failureRedirect: '/' }),
  function(req, res) {
  res.redirect('/auth/loggedIn');
});

router.get('/loggedIn', ensureAuthenticated, function(req, res) {
  var user = req.user;
  if (req.user.admin) {
    res.render('adminControl', {user: user});
  } else {
    res.redirect('/giveawayList');
  }
});

module.exports = router;