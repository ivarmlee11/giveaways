var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/allplayers/', ensureAuthenticated, function(req, res) {
  db.user.findAll().then(function(users) {
    res.send(users)
  })
})

router.get('/playerInfo/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  console.log('getting player info for user ' + id)
  db.user.findById(id).then(function(user) {
    console.log('found user')
    console.log(user)
    console.log('res send user to front end ajax call')
    res.send(user)
  })
})

router.get('/playerList/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    var giveaway = giveaway
    giveaway.getUsers().then(function(users) {
      var playerList = []
      users.forEach(function(user) {
        playerList.push({
          username: user.username,
          auth: user.auth
        })
      })
      res.render('admin/adminShowGiveaway', 
        {
        playerList: playerList,
        giveaway: giveaway
      })
    })
  })
})

router.get('/playerListData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.giveaway.find({
    where: {id: id}
  }).then(function(giveaway) {
    giveaway.getUsers().then(function(users) {
      var playerList = []
      users.forEach(function(user) {
        playerList.push({
          username: user.username,
          id: user.id,
          auth: user.auth,
          ip: user.ip,
          color: user.color
        })
      })
      res.send(playerList)
    })
  })
})

router.post('/addToWinHistory/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx,
    giveaway

  db.giveaway.findById(id).then(function(giveaway) {
    giveaway = giveaway
    db.user.findById(req.body.id).then(function(user) {
      giveaway.addWinner(user)
      res.send('Added to winner group!')
    })
  })    
})

module.exports = router