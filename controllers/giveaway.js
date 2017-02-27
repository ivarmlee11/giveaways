var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  db.giveaway.findAll({ order: '"updatedAt" DESC' }).then(function(giveaways) {
    var giveaway = giveaways
    res.render('admin/adminGameList', 
      {
        giveaways: giveaway
    })
  })
})

router.post('/adminGiveawayList', ensureAuthenticated, modCheck, function(req, res) {
  var timerOption
  if(req.body.options === '0') {
    timerOption = null
  } else {
    timerOption = req.body.options
  }
  db.giveaway.create({
    name: req.body.giveawayName,
    keyphrase: req.body.giveawayKeyPhrase,
    timer: timerOption
  }).then(function(giveaway) {
    var id = giveaway.id
    if(giveaway.timer) {
      console.log(giveaway.timer)
      var time = giveaway.timer * 60
      time = time * 1000
      console.log('timer ' + time)
      setTimeout(function() {
        db.giveaway.update({
          ended: true
        }, {
          where: {
            id: id
          }
        }).then(function(user) {
        })
      }, time)
      req.flash('success', 'You have created a giveaway with a timer.')
      res.redirect('/giveaway/adminGiveawayList')
    } else {
      req.flash('success', 'You have created a giveaway with no timer.')
      res.redirect('/giveaway/adminGiveawayList')
    }
  })
})

router.get('/adminListEndGiveaway/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var giveawayId = req.params.idx
  db.giveaway.update({
    ended: true
  }, {
    where: {
      id: giveawayId
    }
  }).then(function(user) {
    res.redirect('/giveaway/adminGiveawayList')
  })
})

router.get('/giveawayData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    res.send(giveaway)
  })
})

router.get('/hideGiveaway/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx
  db.giveaway.update({
    ended: true,
    hidden: true
  }, {
    where: {
      id: id
    }
  }).then(function(giveaway) {
    req.flash('success', 'You have hidden the giveaway.')
    res.redirect('/giveaway/adminGiveawayList')
  })
})

module.exports = router