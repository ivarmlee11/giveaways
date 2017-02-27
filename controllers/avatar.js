var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    modCheck = require('../middleware/modCheck.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash'),
    cloudinary = require('cloudinary'),
    multer = require('multer'),
    upload = multer({ dest: './uploads/' })

// display winner with avi

router.get('/aviget/:idx', ensureAuthenticated, function(req, res) {
  db.user.findById(req.user.id).then(function(user) {
    user.approvedThumb ?  res.send(user.cloudinary) : res.send('Not approved')
  })
})

// player uploads avi via cloudinary

router.post('/avichange/:idx', ensureAuthenticated, upload.single('myFile'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    console.log(result)
    db.user.update({
      cloudinary: result.url,
      approvedThumb: false
    }, {
      where: {
        id: req.user.id
      }
    }).then(function(user) {
      req.flash('success', 'Profile picture changed, waiting for approval.')
      res.redirect('back')
    })
  },  
  {
    crop: 'scale',
    width: 250
  }   
)
})

  // avi approve

// get list of avis that need approval

router.get('/approveList', ensureAuthenticated, modCheck, function(req, res) {
  var thumbList = []
  db.user.findAll().then(function(users) {
    console.log('users ' + users.length)
    users.forEach(function(user) {
      if(user.dataValues.approvedThumb === false) {
        thumbList.push(user)
      }
    })
    res.render('admin/approveThumbnails', {thumbList: thumbList})
  })
})

// approve specific images

router.post('/approveList/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx
  db.user.update({
    approvedThumb: true
  }, {
    where: {
      id: id
    }
  }).then(function(user) {
    req.flash('success', 'Profile picture approved.')
    res.redirect('back')
  })
})

module.exports = router

