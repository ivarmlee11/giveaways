var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    bodyParser = require('body-parser'),
    db = require('../models'),
    flash = require('connect-flash')

router.get('/gameDataOnly', ensureAuthenticated, modCheck, function(req, res) {
  db.game.findAll().then(function(games) {
    var games = games
    res.send(games)
  })
})

router.get('/removeGame/:idx', ensureAuthenticated, modCheck, function(req, res) {
  var id = req.params.idx
  db.game.destroy({
    where: {
      id: id
    }
  })
  .then(function() {
    req.flash('success', 'You have removed the game.')
    res.redirect('/admin/')
  })
  .catch(function(err) {
    console.log(err)
    req.flash('error', 'There was an error removing that user.')
    res.redirect('/admin/')
  })
})

router.post('/addGame/', ensureAuthenticated, modCheck, function(req, res) {
  var name = req.body.addGameName,
      code = req.body.addGameCode,
      owner = req.body.addGameOwner,
      auth = req.body.addAuthChoice
  if(owner.length) {
    db.user.find({
      where: {
        username: owner,
        auth: auth
      }
    })
    .then(function(user) {
      var userId = user.id
      db.game.create({
        name: name,
        code: code,
        userId: userId,
        owned: true
      })
      .then(function(game) {
        req.flash('success', 'You have added a game with an owner.')
        res.redirect('/admin/')
      })
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error finding that user.')
      res.redirect('/admin/')
    })
  } else {
    db.game.create({
      name: name,
      code: code,
      owned: false
    })
    .then(function(game) {
      req.flash('success', 'You have added a game without an owner.')
      res.redirect('/admin/')
    })
  }
})

router.post('/edit/', ensureAuthenticated, modCheck, function(req, res) {
  var gameId = parseInt(req.body.currentGameId),
      name = req.body.editGameName,
      code = req.body.editGameCode,
      owner = req.body.editGameOwner,
      auth = req.body.editAuthChoice
  if(owner.length) {
    db.user.find({
      where: {
        username: owner,
        auth: auth
      }
    })
    .then(function(user) {
      var userId = user.id
      db.game.update({
        name: name,
        code: code,
        userId: userId,
        owned: true
      }, {
        where: {
          id: gameId
        }
      })
      .then(function(game) {
        req.flash('success', 'You have edited a game with an owner.')
        res.redirect('/admin/')
      })
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error finding that user.')
      res.redirect('/admin/')
    })
  } else {
    db.game.update({
      name: name,
      code: code,
      owned: false
    }, {
      where: {
        id: gameId
      }
    })
    .then(function(game) {
      req.flash('success', 'The game has no owner.')
      res.redirect('/admin/')
    })
  }
})

router.get('/gameData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.game.findById(id).then(function(game) {
    res.send(game)
  })    
})

router.post('/uploadGameData', ensureAuthenticated, modCheck, function(req, res) {

  var file = req.body.data,
  gameList = []

  file.forEach(function(game) {
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
        code: game.code,
        price: game.price,
        coderevealed: game.coderevealed,
        owned: null,
        userId: null
      })
      .then(function(data) {
      })
      .catch(function(err) {
        console.log(err)
        req.flash('error', 'There was an error uploading that game data.')
        res.redirect('/admin/')
      })
    }
  })
  req.flash('success', 'Games added.')
  res.redirect('back')
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
  var trade = req.body,
  gamesA = trade.gamesA,
  gamesB = trade.gamesB,
  traderA = trade.traderA,
  traderB = trade.traderB

  gamesA.forEach(function(gameTrade) {
    db.game.update({
      userId: traderB
    }, {
      where: {
        id: gameTrade
      }
    })
    .then(function() {
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error trading.')
      res.redirect('/')
    })
  })

  gamesB.forEach(function(gameTrade) {
    db.game.update({
      userId: traderA
    }, {
      where: {
        id: gameTrade
      }
    })
    .then(function() {
    })
    .catch(function(err) {
      console.log(err)
      req.flash('error', 'There was an error trading.')
      res.redirect('/')
    })
  })

  req.flash('success', 'Games traded.')
  res.redirect('back')
})

router.get('/claimed/:idx', ensureAuthenticated, function(req, res) {
  var gameId = req.params.idx,
      userId = req.user.dataValues.id

  db.game.find({
    where: {id: gameId}
  }).then(function(game) {
    if(userId === game.userId) {
      db.game.update({
        coderevealed: true
      }, {
        where: {
          id: gameId
        }
      })
      .then(function(game) {
        req.flash('success', 'Code revealed. You now own this game.') 
        res.redirect('back')
      })
      .catch(function(err) {
        console.log(err)
        req.flash('error', 'There was an error finding claimed games.')
        res.redirect('/')
      })
    } else {
      req.flash('success', 'You do not own that game.') 
      res.redirect('back')
    }
  })
})

module.exports = router