var express = require("express"),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models');

router.post('/adminListAdd', ensureAuthenticated, function(req, res) {
  db.user.update({
    admin: true
  }, {
    where: {
      username: req.body.adminNameGive,
      auth: req.body.auth
    }
  }).then(function(user) {
    res.redirect('/admin/adminList');
  });
});

router.post('/adminListRemove', ensureAuthenticated, function(req, res) {
  var adminName = req.body.adminName,
      auth = req.body.auth;

  if(adminName === req.user.username) {
    res.send('You cannot demod yourself.');
  }

  db.user.update({
    admin: false
  }, {
    where: {
      username: adminName,
      auth: auth
    }
  }).then(function(user) {
    res.redirect('back');
  });

});

router.get('/adminList', ensureAuthenticated, function(req, res) {
  if(req.user.admin) {
    db.user.findAll({
      where: {
        admin: true
      }
    }).then(function(allAdmins) {
      var allAdmins = allAdmins;
      res.render('adminList', {allAdmins: allAdmins});
    });
  } else {
    res.redirect('/');
  }
});

router.get('/adminGiveawayList', ensureAuthenticated, function(req, res) {
  if(req.user.admin) {
    db.giveaway.findAll().then(function(giveaways) {
      var giveaway = giveaways;
      res.render('adminGameList', {giveaways: giveaway});
    });
  } else {
    res.redirect('/');
  }  
});

router.post('/adminGiveawayList', ensureAuthenticated, function(req, res) {
  if(req.user.admin) {
    db.giveaway.findOrCreate({
      where: {
        name: req.body.giveawayName,
        keyphrase: req.body.giveawayKeyPhrase
      }
    }).spread(function(giveaway, created) {
      res.redirect('/admin/adminGiveawayList');
    });
  } else {
    res.redirect('/');
  }
});

router.get('/playerList/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
    // use join table to get all players associated with the req params id
    res.render('adminShowGiveaway', {playerList: playerList});
 
});

router.get('/winner/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
    // use join table to get all players associated with the req params id
    res.send({playerList: playerList});
});

router.get('/deleteGiveaway/:idx', ensureAuthenticated, function(req, res) {
  if(req.user.admin) {
    var id = req.params.idx;
    db.giveaway.destroy({
      where: { id: id }
    }).then(function() {
      res.redirect('/admin/adminGiveawayList');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;