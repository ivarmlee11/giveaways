var express = require('express'),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    moment = require('moment-timezone'),
    flash = require('connect-flash');

// admin controls

router.get('/makeAGiveaway', ensureAuthenticated, modCheck, function(req, res) {
  res.render('admin/adminControl');
});

router.get('/adminList', ensureAuthenticated, modCheck, function(req, res) {
  db.user.findAll({
    where: {
      admin: true
    }
  }).then(function(allAdmins) {
    var allAdmins = allAdmins;
    res.render('admin/adminList', {allAdmins: allAdmins});
  });
});

router.post('/adminListAdd', ensureAuthenticated, modCheck, function(req, res) {
  db.user.update({
    admin: true
  }, {
    where: {
      username: req.body.adminNameGive,
      auth: req.body.auth
    }
  }).then(function(user) {
    req.flash('success', 'Admin added.');
    res.redirect('/admin/adminList');
  });
});

router.post('/adminListRemove', ensureAuthenticated, modCheck, function(req, res) {
  var adminName = req.body.adminName,
      auth = req.body.auth;

  console.log(adminName + ' admin name');
  console.log(req.user.username + ' req.user.username');

  if(adminName === req.user.username) {
    console.log('your names are the same, you cannot demod yaself')
    req.flash('success', 'You cannot demod yourself.');
    res.redirect('/admin/adminList');
  } else {
    db.user.update({
      admin: false
    }, {
      where: {
        username: adminName,
        auth: auth
      }
    }).then(function(user) {
      req.flash('success', 'You removed adminList status.');
      res.redirect('/admin/adminList');
    });
  }
});


module.exports = router;