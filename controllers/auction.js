var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    moment = require('moment-timezone'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash')

router.get('/viewerAuction', ensureAuthenticated, function(req, res) {
  res.render('viewerAuction')
})

router.get('/adminAuction', ensureAuthenticated, modCheck, function(req, res) {
  res.render('admin/adminAuction')
})

router.get('/auctionData', ensureAuthenticated, function(req, res) {
  db.auction.findOne({
    where: {
      ended: null
    }
  })
  .then(function(auction) {
    res.send(auction)
  })
})

router.post('/adminAuction', ensureAuthenticated, modCheck, function(req, res) {

  var auctionName = req.body.auctionName,
      prize = req.body.prize,
      timer = parseInt(req.body.timer),
      gameListId = parseInt(req.body.gameListId),
      auctionId

  db.auction.create({
    name: auctionName,
    prize: prize,
    timer: timer
  }).then(function(auction) {
    console.log(auction)
    var time = auction.timer * 60
    time = time * 1000
    var auctionId = auction.id
    console.log('timer ' + time)
    setTimeout(function() {
      db.auction.update({
        ended: true
      }, {
        where: {
          id: auctionId
        }
      }).then(function(auction) {
        console.log(auction.id + 'auction ended')
      })
    }, time)
    req.flash('success', 'You have created an auction.')
    res.redirect('/auction/viewerAuction')
  })
})

module.exports = router