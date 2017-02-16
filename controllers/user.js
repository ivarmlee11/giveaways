  var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/colorget/:idx', ensureAuthenticated, function(req, res) {
  console.log('color get')
  var id = req.params.idx
  console.log(id)
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
  var id = req.params.idx
  console.log('color change')
  console.log(req.body.color)
  console.log(req.user.dataValues.id)
  console.log(id)
  console.log(req.user.dataValues.id == id)
  console.log(req.user.dataValues.id === id)

  if(req.user.dataValues.id == id) {
    db.user.update({
      color: req.body.color
    }, {
      where: {
        id: id
      }
    }).then(function() {
      req.flash('success', 'Color changed. Check yourself out next time the wheel spins.') 
      res.send('Changed!')
    })
  } else {
    res.send('Bro...')
  }
})

module.exports = router;

