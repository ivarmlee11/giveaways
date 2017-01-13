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
  var user = req.user;
  if (req.user.admin) {
    res.render('admin/adminControl', {user: user});
    req.flash('success', 'Admin logged in.');
  } else {
    res.redirect('/giveawayList');
    req.flash('success', 'Welcome back.');
  }
});

module.exports = router;