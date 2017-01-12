var express = require('express'),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    moment = require('moment-timezone'),
    flash = require('connect-flash');

// game interaction

router.get('/gameData', ensureAuthenticated, modCheck, function(req, res) {

  db.game.findAll().then(function(games) {
    var games = games;
    res.render('admin/gameData', {games: games});
  });

});

router.get('/gameDataOnly', ensureAuthenticated, modCheck, function(req, res) {

  db.game.findAll().then(function(games) {
    var games = games;
    res.send(games);
  });

});

router.post('/uploadGameData', ensureAuthenticated, modCheck, function(req, res) {
  var file = req.body.uploadGameData,
    parsed = Baby.parseFiles(file),
    dataList = parsed.data,
    gameList = [];

  dataList.forEach(function(game) {
    gameList.push({
      name: game[0],
      price: game[1],
      code: game[2],
      coderevealed: game[3]
    });
  });

  gameList.forEach(function(game) {
    if(game.coderevealed === undefined) {
      return;
    } else {
    db.game.create({
      name: game.name,
      price: game.price,
      code: game.code,
      coderevealed: game.coderevealed
    }).then(function(data) {
    });
    }
  });
  req.flash('success', 'Games added.');
  res.redirect('/game/gameData');
});

router.post('/winnerCard/', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx,
    // redirectUrl = '/player/playerList/' + id,
    giveaway;

  db.giveaway.findById(id).then(function(giveaway) {
    giveaway = giveaway;
    // if(!giveaway.ended) {
    console.log(req.body)

    // db.user.findById(req.body.userId).then(function(user) {
    //   giveaway.addWinner(user);
    //   res.send('Added to winner group!');
    // });

  });    
});


module.exports = router;