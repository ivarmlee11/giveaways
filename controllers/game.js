var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    moment = require('moment-timezone'),
    flash = require('connect-flash'),
    Baby = require('babyparse')

router.get('/gameData', ensureAuthenticated, modCheck, function(req, res) {
  db.game.findAll().then(function(games) {
    var games = games
    res.render('admin/gameData', {games: games})
  })
})

router.get('/gameDataOnly', ensureAuthenticated, modCheck, function(req, res) {
  db.game.findAll().then(function(games) {
    var games = games
    res.send(games)
  })
})

router.get('/gameData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.game.findById(id).then(function(game) {
    res.send(game)
  })    
})

router.post('/uploadGameData', ensureAuthenticated, modCheck, function(req, res) {
  var file = req.body.uploadGameData,
  config = {
      error: function(error, file) {
                console.log(error)
                console.log(file)
              },
      complete: function(results, file) {
                console.log('done')
                console.log(file)
                console.log(results)
              }
    },
    parsed = Baby.parseFiles(file),
    dataList = parsed.data,
    gameList = []

  dataList.forEach(function(game) {
    gameList.push({
      name: game[0],
      price: game[1],
      code: game[2],
      coderevealed: game[3]
    })
  })

  gameList.forEach(function(game) {
    if(game.coderevealed === undefined) {
      return
    } else {
      db.game.create({
        name: game.name,
        price: game.price,
        code: game.code,
        coderevealed: game.coderevealed
      }).then(function(data) {
      })
    }
  })
  req.flash('success', 'Games added.')
  res.redirect('/game/gameData')
})

router.post('/assignWinnerCard/', ensureAuthenticated, modCheck, function(req, res) {
  db.game.findById(req.body.gameId).then(function(game) {
    db.user.findById(req.body.userId).then(function(user) {
      user.addGame(game)
      db.game.update({
        owned: true
      }, {
        where: {
          id: req.body.gameId
        }
      }).then(function(game) {
        res.send('Added to winner group with a game')
      })
    })
  })  
})

router.get('/winnerCard/', ensureAuthenticated, function(req, res) {
  var id = req.user.id
  db.user.findById(id).then(function(user) {
    user.getGames().then(function(games) {
      var games = games
      if(games.length === 0) {
        games = []
        res.send(games)
      } else {
        res.send(games)
      }
    })
  })   
})

router.post('/trade/', ensureAuthenticated, function(req, res) {
  console.log('req.body')
  console.log(req.body)
  var trade = req.body,
  gamesA = [],
  gamesB = [],
  traderA = trade.traderA,
  traderB = trade.traderB

  if(trade.gamesA) {
    gamesA = trade.gamesA
  }

  if(trade.gamesB) {
    gamesB = trade.gamesB
  }

  gamesA.forEach(function(gameTrade) {
    db.game.update({
      userId: traderA
    }, {
      where: {
        id: gameTrade
      }
    }).then(function(game) {

    })
  })

  gamesB.forEach(function(gameTrade) {
    db.game.update({
      userId: traderB
    }, {
      where: {
        id: gameTrade
      }
    }).then(function(game) {

    })
  })

  res.send('ok')
})

module.exports = router