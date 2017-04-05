var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    modCheck = require('../middleware/modCheck.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/user/:idx', ensureAuthenticated, function(req, res) {
  var id = parseInt(req.params.idx) 

  db.user.findById(id)
    .then(function(user) {
      user.getKiwi()
        .then(function(kiwi) {
          if(!kiwi) {
            console.log(user.username + ' does not have a kiwi account')
            user.createKiwi({
              points: 0,
              userId: id
            })
            .then(function(kiwi) {
              console.log(user.username + ' now has a kiwi account')
              res.send({points: kiwi.points})
            })
          } else {
            console.log('kiwi account found for ' + user.username)
            console.log(user.username + ' has this many points... ' + kiwi.points)
            res.send({points: kiwi.points})
          }
        })
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error finding the user.')
      res.redirect('/')
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
        db.user.findById(id)
          .then(function(user) {
            user.createKiwi({
              points: kiwiCoins,
              userId: id
            })
            .then(function(kiwi) {
            console.log('a kiwi account was created for this user '
              + user.username + ' with this many points: ' + kiwi.points )
            res.send({points: kiwi.points})
            })
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
          console.log('kiwi points updated')
          res.send({points: kiwi.points})
        })
      }
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error finding the Kiwi account.')
      res.redirect('/')
    })

})

module.exports = router