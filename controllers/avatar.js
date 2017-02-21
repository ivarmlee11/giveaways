var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    modCheck = require('../middleware/modCheck.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash'),
    cloudinary = require('cloudinary')

// display winner with avi

router.get('/aviget/:idx', ensureAuthenticated, function(req, res) {

})



router.post('/avichange/:idx', ensureAuthenticated, function(req, res) {
  console.log(req.file.path)
  var file = req.body.imgUrl,
      id = parseInt(req.params.idx)
  if(req.user.dataValues.id === id) {
    // update the image and change the approve value to false
  }
})

  // avi approve

// get list of avis that need approval

router.get('/approveList', ensureAuthenticated, modCheck,function(req, res) {
  res.render('admin/approveThumbnails')
})

// approve specific images

router.post('/approveList/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx
})


module.exports = router;

