var express = require("express"),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    passport = require('../config/ppConfig'),
    flash = require('connect-flash')

router.get('/twitch', 
  passport.authenticate('twitchtv'))

router.get('/twitch/callback', 
  passport.authenticate('twitchtv',  { failureRedirect: '/' }), 
  function(req, res) {
  res.redirect('/auth/loggedIn')
})

router.get('/beam',
  passport.authenticate('beam'))

router.get('/beam/callback',
  passport.authenticate('beam', { failureRedirect: '/' }),
  function(req, res) {
  res.redirect('/auth/loggedIn')
})

router.get('/loggedIn', ensureAuthenticated, function(req, res) {
  if (req.user.admin) {
    req.flash('success', 'Admin logged in.')
    res.redirect('/admin/')
  } else {
    req.flash('success', 'User logged in.')
    res.redirect('/giveawayList')
  }
})

module.exports = router