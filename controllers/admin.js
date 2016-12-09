var express = require('express'),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    flash = require('connect-flash');

router.post('/adminListAdd', ensureAuthenticated, function(req, res) {
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

router.post('/adminListRemove', ensureAuthenticated, function(req, res) {
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
      console.log('user updated');
      req.flash('error', 'You removed admin status.');
      res.redirect('/admin/adminList');
    });
  }
});

router.get('/adminListEndGiveaway/:idx', ensureAuthenticated, function(req, res) {
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
  // if(req.user.admin) {
    db.user.findAll({
      where: {
        admin: true
      }
    }).then(function(allAdmins) {
      var allAdmins = allAdmins;
      res.render('admin/adminList', {allAdmins: allAdmins});
    });
  // } else {
    // res.redirect('/');
  // }
});

router.get('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  // if(req.user.admin) {
    db.giveaway.findAll().then(function(giveaways) {
      var giveaway = giveaways;
      res.render('admin/adminGameList', {giveaways: giveaway});
    });
  // } else {
    // res.redirect('/');
  // }  
});

router.post('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  // if(req.user.admin) {
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
      db.win.findOrCreate({
        where: {
          name: req.body.giveawayName
        }
      }).spread(function(giveaway, created) {
        req.flash('success', 'You have created a giveaway.')
        res.redirect('/admin/adminGiveawayList');
      });

    });
  // } else {
    // res.redirect('/');
  // }
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
  var id = req.params.idx;
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    giveaway.getUsers().then(function(users) {
      var playerList = [];
      users.forEach(function(user) {
        playerList.push({
          username: user.username,
          auth: user.auth,
          ip: user.ip
        });
      });
      res.send(playerList);
    });
  });
});

router.get('/userWinHistory/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;

});

router.post('/addToWinHistory/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
  console.log('posted to win history route');
  console.log(req.body.username + ' added');
  res.redirect('back');
});

router.get('/deleteGiveaway/:idx', ensureAuthenticated, function(req, res) {
  // if(req.user.admin) {
    var id = req.params.idx;
    db.giveaway.destroy({
      where: { id: id }
    }).then(function() {
      req.flash('success', 'You have deleted the giveaway.')
      res.redirect('/admin/adminGiveawayList');
    });
  // } else {
    // res.redirect('/');
  // }
});

module.exports = router;