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
  console.log(adminName);
  console.log(req.user.username);
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
  var timerOption;
  console.log(req.body);
  if(req.body.options === '0') {
    timerOption = null;
  } else {
    timerOption = req.body.options;
  }
  db.giveaway.create({
    name: req.body.giveawayName,
    keyphrase: req.body.giveawayKeyPhrase,
    timer: timerOption
  }).then(function(giveaway) {
    var id = giveaway.id;
    if(giveaway.timer) {
      console.log(giveaway.timer)
      var time = giveaway.timer * 60;
      time = time * 1000;
      console.log('timer ' + time);
      setTimeout(function() {
        db.giveaway.update({
          ended: true
        }, {
          where: {
            id: id
          }
        }).then(function(user) {
        });
      }, time);
      req.flash('success', 'You have created a giveaway with a timer.');
      res.redirect('/admin/adminGiveawayList');
    } else {
      req.flash('success', 'You have created a giveaway with no timer.');
      res.redirect('/admin/adminGiveawayList');
    }
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
      res.send(playerList);
    });
  });
});

router.get('/giveawayData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;

  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    res.send(giveaway);
  });
});

router.post('/addToWinHistory/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx,
    redirectUrl = '/admin/playerList/' + id,
    giveaway;

  db.giveaway.findById(id).then(function(giveaway) {
    giveaway = giveaway;
    // if(!giveaway.ended) {
    db.user.findById(req.body.id).then(function(user) {
      giveaway.addWinner(user);
      res.send('Added to winner group!');
    });
  });

});

router.get('/hideGiveaway/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx;

  db.giveaway.update({
    ended: true,
    hidden: true
  }, {
    where: {
      id: id
    }
  }).then(function(giveaway) {
    req.flash('success', 'You have hidden the giveaway.');
    res.redirect('/admin/adminGiveawayList');
  });

});

module.exports = router;