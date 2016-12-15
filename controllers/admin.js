var express = require('express'),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    flash = require('connect-flash');

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
  if(adminName === req.user.username) {
    req.flash('error', 'You cannot demod yourself.');
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
      req.flash('error', 'You removed admin status.');
      res.redirect('/admin/adminList');
    });
  }
});

router.get('/adminListEndGiveaway/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var giveawayId = req.params.idx;
  db.giveaway.update({
    ended: true
  }, {
    where: {
      id: giveawayId
    }
  }).then(function(user) {
    res.redirect('/admin/adminGiveawayList');
  });
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

router.get('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('admin/adminGameList', {giveaways: giveaway});
  });
});

router.post('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  db.giveaway.findOrCreate({
    where: {
      name: req.body.giveawayName,
      keyphrase: req.body.giveawayKeyPhrase
    }
  }).spread(function(giveaway, created) {
    if(!created) {
      req.flash('error', 'A giveaway with this name already exists.');
      res.redirect('/admin/adminGiveawayList');
    };

    req.flash('success', 'You have created a giveaway.');
    res.redirect('/admin/adminGiveawayList');

  });
});

router.get('/playerList/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    var giveaway = giveaway;
    giveaway.getUsers().then(function(users) {
      var playerList = [];
      users.forEach(function(user) {
        playerList.push({
          username: user.username,
          auth: user.auth
        });
      });
      res.render('admin/adminShowGiveaway', 
        {
        playerList: playerList,
        giveaway: giveaway
      });
    });
  });
});

router.get('/playerListData/:idx', ensureAuthenticated, function(req, res) {
  console.log(req.user.username + ' is on the playerListData route. they are viewing an autoupdated page on the giveaway.')
  var id = req.params.idx;
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    giveaway.getUsers().then(function(users) {
      var playerList = [];
      users.forEach(function(user) {
        playerList.push({
          username: user.username,
          id: user.id,
          auth: user.auth,
          ip: user.ip
        });
      });
      console.log('HEYYYYYYYYYYYY')
      res.send(playerList);
    });
  });
});

router.get('/userWinHistory/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
});

router.post('/addToWinHistory/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx;


  db.giveaway.findById(id).then(function(giveaway) {
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log(giveaway.name + ' was found')
        console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')

    db.user.findById(req.body.id).then(function(user) {
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log('----------------------------')
    console.log(user.username + ' was found')

      res.redirect('back');
    });
  });
});

router.get('/deleteGiveaway/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx;
  db.giveaway.destroy({
    where: { id: id }
  }).then(function() {
    req.flash('success', 'You have deleted the giveaway.')
    res.redirect('/admin/adminGiveawayList');
  });
});

module.exports = router;