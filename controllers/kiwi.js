var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    modCheck = require('../middleware/modCheck.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/user/:idx', ensureAuthenticated, function(req, res) {
  var id = parseInt(req.params.idx) 

  console.log(typeof id + ' typeof id')

  db.user.findById(id)
    .then(function(user) {
      console.log(user.username + ' found')
      user.getKiwi()
        .then(function(kiwi) {
          if(kiwi === null) {
            console.log(user.username + ' does not have a kiwi account')
            user.createKiwi({
              points: 0,
              userId: id
            })
            .then(function(kiwi) {
              console.log('kiwi created')
              var points = kiwi.dataValues.points
              console.log('points ' + points)
              res.send({points: points})
            })
          } else {
            console.log('kiwi found')
            var points = kiwi.dataValues.points
            console.log('points ' + points)
            res.send({points: points})
          }
        })
    })
})

router.post('/user/update/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = parseInt(req.params.idx),
      kiwiCoins = parseInt(req.body.points)

    db.kiwi.find({
      where: {
        userId: id
      }
    })
    .then(function(kiwi) {
    
      if(!kiwi) {
        db.kiwi.create({
          points: kiwiCoins,
          userId: id
        })
        .then(function(kiwi) {
          console.log('kiwi created')
          var points = kiwi.dataValues.points
          console.log('points ' + points)
          res.send({points: points})
        }) 
      } else {
        db.kiwi.update({
          points: kiwiCoins
        }, {
          where: {
            userId: id
          }
        })
        .then(function(kiwi) {
          db.kiwi.findById(kiwi[0])
          .then(function(kiwi) {
            console.log('kiwi found')
            console.log(kiwi)
            var points = kiwi.points
            console.log('points ' + points + ' altered')
            res.send({points: points})
          })
        }) 
      }
    })
})

module.exports = router