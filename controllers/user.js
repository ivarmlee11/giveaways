  var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/colorget/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.user.find({
    where: {id: id}
  }).then(function(user) {
    console.log('sending ' + user.color)
    if(user.color === null) {
      user.color = 'black'
    }
    res.send(user.color)
  })
})

router.post('/changecolor/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx,
      redirect = '/profile/' + id
  if(req.user.dataValues.id == id) {
    db.user.update({
      color: req.body.color
    }, {
      where: {
        id: id
      }
    }).then(function(user) {
      res.send(user.color)
    })
  } else {
    res.send('Bro...')
  }
})

module.exports = router

