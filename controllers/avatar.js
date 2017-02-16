var express = require('express'),
    router = express.Router(),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/aviget/:idx', function(req, res) {

})

router.post('/avichange/:idx', ensureAuthenticated, function(req, res) {

})

// avi approve

// get list of avis that need approval

// display winner with avi



module.exports = router;

