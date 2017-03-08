var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash'),
		passport = require('../config/ppConfig')

 router.get('/signup', function(req, res) {
 	res.render('maintenance/signup')
 })

router.post('/signup', function(req, res) {
	console.log(req.body)
	console.log('signed up')
  // find or create a user, providing the name and password as default values
  db.user.findOrCreate({
    where: { username: req.body.username },
    defaults: {
      username: req.body.username,
      password: req.body.password
    }
  }).spread(function(user, created) {
    if (created) {
      // if created, success and redirect home
      console.log('ADMIN created!')
      res.redirect('/testUser/login')

    } else {
      // if not created, the email already exists
      console.log('ADMIN already exists')
      // res.redirect('/testUser/signup')
    }
  }).catch(function(error) {
    // if an error occurs, let's see what the error is
    console.log('An error occurred you dumb ass: ', error.message)
    res.redirect('/testUser/signup')
  })
})

router.get('/login', function(req, res) {
	res.render('maintenance/login')
})

router.post('/login', passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.isAuthenticated() + ' user authed with passport local')
    res.redirect('/auth/loggedIn')
  })


 module.exports = router