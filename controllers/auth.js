var express = require("express"),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    passport = require('../config/ppConfig'),
    flash = require('connect-flash');

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
  if (req.user.admin) {
    req.flash('success', 'Admin logged in.');
    res.redirect('/giveaway/adminGiveawayList');
  } else {
    req.flash('success', 'Welcome back.');
    res.redirect('/giveawayList');
  }
});

module.exports = router;