  var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/colorget/:idx', function(req, res) {
  console.log('color get')
  var id = req.params.idx
  db.user.find({
    where: {id: id}
  }).then(function(user) {
    res.send(user.color)
  })
})

router.post('/changecolor/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  console.log('color change')
  console.log(req.body.color)
  if(req.user.dataValues.id === id) {
    db.user.update({
      color: req.body.color
    }, {
      where: {
        id: id
      }
    }).then(function(game) {
      req.flash('success', 'Color changed. Check yourself out next time the wheel spins.') 
      res.redirect('back')
    })
  } else {
    req.flash('success', 'Do not try to change stuff that does not belong to you.') 
    res.redirect('back')    
  }
})

module.exports = router;

