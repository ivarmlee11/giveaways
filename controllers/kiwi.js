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
      console.log(user.username + ' found')
      user.getKiwi()
        .then(function(kiwi) {
          
          console.log('kiwi for ' + user.username)
          var points = kiwi.points
          console.log(user.username + ' has this many points... ' + points)
          res.send({points: points})
        
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
  
    db.kiwi.update({
      points: kiwiCoins
    }, {
      where: {
        userId: id
      }
    })
    .then(function(kiwi) {
      db.kiwi.findById(id)
      .then(function(kiwi) {

        var points = kiwi.points
        console.log('points ' + points + ' altered')
        res.send({points: points})
      })
    }) 
    
  })
  .catch(function(err) {
    console.log(err)
    req.flash('error', 'There was an error finding the Kiwi account.')
    res.redirect('/')
  })

})

module.exports = router