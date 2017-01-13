var express = require('express'),
    router = express.Router(),
    passport = require('../config/ppConfig'),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    moment = require('moment-timezone'),
    flash = require('connect-flash'),
    Baby = require('babyparse');

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

router.post('/assignWinnerCard/', ensureAuthenticated, modCheck, function(req, res) {
  db.game.findById(req.body.gameId).then(function(game) {
    db.user.findById(req.body.userId).then(function(user) {
      game.addUser(user);
      db.game.update({
        owned: true
      }, {
        where: {
          id: req.body.gameId
        }
      }).then(function(game) {
        res.send('Added to winner group with a game');
      });
    });
  });  
});

router.get('/winnerCard/', ensureAuthenticated, function(req, res) {
  var id = req.user.id;
  db.user.findById(id).then(function(user) {
    user.getGames().then(function(games) {
      var games = games;
      if(games.length === 0) {
        games = [];
        res.send(games);
      } else {
        res.send(games);
      }
    })
  });   
});

module.exports = router;