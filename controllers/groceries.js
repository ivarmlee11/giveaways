var express = require('express'),
    router = express.Router(),
    modCheck = require('../middleware/modCheck.js'),
    ensureAuthenticated = require('../middleware/ensureAuth.js'),
    db = require('../models'),
    bodyParser = require('body-parser'),
    flash = require('connect-flash'),
    twitchBot = require('../chatBots/twitchBot.js'),
    binarySearch = require('../helpers/search.js')
    // beamBot = require('../chatBots/beamBot.js'), // only emitting channel wide stuff twitch

router.get('/', ensureAuthenticated, modCheck, function(req, res) {
  var total = 0,
      users = [],
      isGameRunning = null
  db.grocerygame.findOne({
    where: {
      ended: null
    }
  }).then(function(grocerygameLive) {
    if(!grocerygameLive) {
      db.grocerygame.findAll({
        limit: 1,
        order: [ [ 'createdAt', 'DESC' ]]
      }).then(function(grocerygames) {
        var grocerygame = grocerygames[0]
        if(grocerygame) {
          var winner = grocerygame.winner
              total  = grocerygame.total
          console.log(winner + ' winner')
          console.log(total + ' total')
          if(winner) {
            db.user.findById(winner).then(function(user) {
              var winnerString = user.username + ', a ' + user.auth + ' user, won the last guessing game.'          
              res.render('groceries/groceries', {
                lastWinner: winnerString,
                total: total,
                users: users,
                isGameRunning: false,
                winnerString: null
              })
            })
          } else {
            var winnerString = 'Nobody entered the last game.'

            res.render('groceries/groceries', {
              lastWinner: winnerString,
              total: total,
              users: users,
              isGameRunning: false,
              winnerString: null
            })
          }
        } else {
          res.render('groceries/groceries', {
            lastWinner: null,
            total: total,
            users: users,
            isGameRunning: false,
            winnerString: null
          })
        }
      })
    } else {
      db.grocerygame.findOne({
        where: {
          ended: null
        }
      }).then(function(grocerygame) {
        var grocerygame = grocerygame
        res.render('groceries/groceries', {
          lastWinner: null,
          total: total,
          users: users,
          isGameRunning: true,
          winnerString: null
        })
      })
    }
  })
})

router.get('/guessingPeriod/:username/:auth/', function(req,res) {
  var username = req.params.username,
      auth     = req.params.auth
  db.user.find({
    where: {
      username: username,
      auth: auth
    }
  }).then(function(user) {
    if(user) {
      var userId = user.id
      db.grocerygame.find({
        where: {
          ended: null
        }
      }).then(function(grocerygame) {
        if(grocerygame) {
          var grocerygameId = grocerygame.id
          db.usersGrocerygames.find({
            where: {
              grocerygameId: grocerygameId,
              userId: userId
            }
          }).then(function(usersGrocerygame) {
            usersGrocerygame ? res.send(usersGrocerygame.guess) : res.send('No guess has been made.')
          })
        } else {
          res.send('There is no guessing game running.')
        }
      })
    } else {
      res.send('You are not signed up for the Tweak web application! Sign up and you can start playing!')
    }
  }).catch(function(error) {
    res.send('Error')
  })
})

router.get('/guessingPeriod/:username/:auth/:guess', function(req, res) {
  var username = req.params.username,
      auth   = req.params.auth,
      guess  = req.params.guess
  db.grocerygame.findOne({
    where: {
      ended: null
    }
  }).then(function(grocerygame) {
    if((grocerygame) && (grocerygame.ended === null)) {
      db.user.find({
        where: {
          username: username,
          auth: auth
        }
      })
      .then(function(user) {
        if(user) {
          var userId = user.id
          grocerygame.addUser(user)
            .then(function(user) {
              db.usersGrocerygames.update({
                  guess: guess
                }, {
                  where: {
                    userId: userId
                  }
                }).then(function(usersGrocerygame) {
                  res.send('Guess added!')
                })  
            })
        } else {
          res.send('You are not signed up for the Tweak web application!')
        }
      })
    } else {
      res.send('The guessing game is not running at this time.')
    }
  }).catch(function(error) {
    res.send('Error')
  })
})

router.post('/guessingPeriod/end', ensureAuthenticated, modCheck, function(req, res) {
  var totalPrice = parseFloat(req.body.groceryPrice)
  var totalPriceInt = null
  if(!isNaN(totalPrice)) {
    totalPriceInt = totalPrice
  }
  console.log(totalPrice)
  console.log(totalPriceInt)
  console.log(typeof totalPrice)
  if(totalPriceInt === null) {
    req.flash('error', 'Make sure you enter a positive number!')
    res.redirect('/groceries/')
  } else {
    db.grocerygame.findOne({
      where: {
        ended: null
      }
    }).then(function(grocerygame) {
      if(grocerygame) {
        var grocerygame = grocerygame
        db.grocerygame.update({
            ended: true,
            total: totalPrice
          }, {
            where: {
              id: grocerygame.id
            }
        }).then(function(game) {
          twitchBot.action('#tweakgames', 'The grocery guessing game has ended!')
          // beam bot action not needed because the bots in the channel relay the message to the beam channel
          db.grocerygame.findById(grocerygame.id).then(function(game) {
            var gameId = null
            var grocerygameId = game.id
            console.log('prize type ' + game.prize)
            if(game.prize == 'games') {
              console.log('game prize is ' + game.prize)
              console.log(game.prizeData)
              gameId = game.prizeData
            }
            var total = parseFloat(game.total)
            game.getUsers().then(function(users) {
              var allUsers = [],
                  closest,
                  winnerString
              users.forEach(function(user) {
                allUsers.push({
                  userId: user.id,
                  username: user.username,
                  auth: user.auth,
                  guess: parseFloat(user.usersGrocerygames.dataValues.guess)
                })
              })
              allUsers.sort(function(a,b) {
                return a.guess - b.guess
              })
              if(allUsers.length > 1) {
                closest = binarySearch(allUsers, total)
              } else if (allUsers.length === 1){
                closest = allUsers[0]
              }
              if(allUsers.length > 0) {
                console.log(closest.username + ', a ' + closest.auth + ' user, won with the guess of $' + closest.guess + '.')
                winnerString = closest.username + ', a ' + closest.auth + ' user, won with the guess of $' + closest.guess + '.'
              } else {
                winnerString = 'Nobody won.'
              }
              // if()
              // twitchBot.action('#tweakgames', '====>WINNER' +  closest.username + ' ' + closest.auth)
              if(gameId && (allUsers.length > 0)) {
                db.grocerygame.update({
                  winner: closest.userId
                  }, {
                  where: {
                    id: grocerygameId
                  }
                }).then(function() {
                  db.user.findById(closest.userId).then(function(user) {
                    var userId = user.id
                    user.addGame(gameId).then(function() {
                      db.game.update({
                        owned: true,
                        userId: userId
                      }, {
                        where: {
                          id: gameId
                        }
                      }).then(function() {
                        res.render('groceries/groceries', 
                          {
                          lastWinner: null,
                          users: allUsers,
                          total: total,
                          isGameRunning: false,
                          winnerString: winnerString
                        })
                      })
                    })
                  })
                })
              } else if (!gameId && (allUsers.length > 0)) {
                db.grocerygame.update({
                  winner: closest.userId
                  }, {
                  where: {
                    id: grocerygameId
                  }
                }).then(function() {
                  res.render('groceries/groceries', 
                    {
                    lastWinner: null,
                    users: allUsers,
                    total: total,
                    isGameRunning: false,
                    winnerString: winnerString
                  })
                })
              } else {
                res.render('groceries/groceries', 
                  {
                  lastWinner: null,
                  users: allUsers,
                  total: total,
                  isGameRunning: false,
                  winnerString: winnerString
                })
              }
            })
          })
        })     
      } else {
        res.redirect('/groceries/')   
      }
    })
  }
})

router.post('/guessingPeriod/start', ensureAuthenticated, modCheck, function(req, res) {
  var prize = req.body.prize,
      gameId,
      userID = req.user.id
  req.body.gameId ? gameId = req.body.gameId : gameId = null
  db.grocerygame.findOne({
    where: {
      ended: null
    }
  }).then(function(grocerygame) {
    if(grocerygame) {
      req.flash('error', 'There is already an guessing game running.')
      res.redirect('/groceries/')
    } else {
      db.grocerygame.create({
        ended: null,
        prize: prize,
        prizeData: gameId
      }).then(function(grocerygame) {
        twitchBot.action('#tweakgames', 'The grocery guessing game has started!')
        // beam bot action not needed because the bots in the channel relay the message to the beam channel
        req.flash('success', 'Guessing game started!')
        res.redirect('/groceries/')
      }).catch(function(err) {
        console.log(err)
      })
    }
  })
})

module.exports = router
