var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/changeColor/:idx', function(req, res) {
  var id = req.params.idx
  console.log(req.body)
  if(req.user.dataValues.id === id) {
    db.user.update({
      color: req.body
    }, {
      where: {
        id: id
      }
    }).then(function(game) {
      req.flash('success', 'Code revealed. You changed your code.') 
      res.redirect('back')
    })
  } else {
    req.flash('success', 'Code revealed. You changed your code.') 
    res.redirect('back')    
  }
})

module.exports = router;

