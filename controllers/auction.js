var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    moment = require('moment-timezone'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash')

router.get('/viewerAuction', ensureAuthenticated, function(req, res) {
  var id = req.user.id
  res.render('viewerAuction', {id: id})
})

router.get('/adminAuction', ensureAuthenticated, modCheck, function(req, res) {
  res.render('admin/adminAuction')
})

router.get('/auctionData', ensureAuthenticated, function(req, res) {
  db.auction.findAll({
    limit: 1,
    order: [ [ 'createdAt', 'DESC' ]]
  }).then(function(auction){
    if(!auction.ended) {
      var auction = auction[0]
      if(auction) {
        res.send(auction)  
      } else {
        res.send('None')
      }
    } else {
      res.send('None')
    }
  })
})

router.post('/viewerAuction/bid', ensureAuthenticated, function(req, res) {
  // console.log(req.body)
  var userId = req.body.userId,
      currentBid = req.body.bid,
      currentKiwis
  db.auction.findAll({
    limit: 1,
    order: [ [ 'createdAt', 'DESC' ]]
  }).then(function(auction) {
    // console.log('bid made')
    // console.log(auction)
    var auction = auction[0],
        highestBid = auction.highestBid,
        auctionId = auction.id
        gameId = auction.gameId

    if(!auction.ended) {
      db.kiwi.find({
        where: {
          userId: userId
        }
      })
      .then(function(kiwi) {
        currentKiwis = kiwi.points
        if (currentBid > highestBid & (currentBid <= currentKiwis)) {
          auction.update({
            userId: userId,
            highestBid: currentBid
          }, {
            where: {
              id: auctionId
            }
          })
          .then(function(auction) {
            if(currentKiwis >= currentBid) {
              var kiwiCountAfterBid = currentKiwis - currentBid
              db.kiwi.update({
                points: kiwiCountAfterBid
              } , {
                where: {
                  userId: userId
                }
              })
              .then(function(kiwi) {
                db.game.update({
                  userId: userId
                }, {
                  where: {
                    id: auctionId
                  }
                })
                .then(function() {
                  res.redirect('back')
                })
              })
            } else {
              res.redirect('back') 
            }
          })
        } else {
          res.redirect('back')
        }
      })
    } else {
      res.redirect('back')
    }
  })
  .catch(function(err) {
    res.render('error', {error: err.msg})
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
    gameId: gameListId,
    timer: timer
  }).then(function(auction) {
    // console.log('auction created')
    // console.log(auction)
    var time = auction.timer * 60
    time = time * 1000
    var auctionId = auction.id
    // console.log('timer ' + time)
    setTimeout(function() {
      // console.log('auction id ' + auctionId)
      // console.log('gameListId ' + gameListId)
      db.auction.update({
        ended: true
      }, {
        where: {
          id: auctionId
        }
      }).then(function(auction) {
        // console.log('auction ended')
        // console.log(auction.userId)
        // console.log('gameListId ' + gameListId)
        db.game.update({
          // userId: auction.userId,
          owned: true
        }, {
          where: {
            id: gameListId
          }
        })
        .then(function(game){
          // console.log('user ' + game.userId + ' won the auction')
        })
      })
    }, time)
    req.flash('success', 'You have created an auction.')
    res.redirect('/auction/viewerAuction')
  })
})

module.exports = router