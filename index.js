var express = require('express'),
    app = express(),
    request = require('request'),
    morgan = require('morgan')('dev'),
    ensureAuthenticated = require('./middleware/ensureAuth.js'),
    port = process.env.PORT || 3000,
    db = require('./models'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    sessionSecret = process.env.SESSION,
    session = require('express-session'),
    server  = require('http').Server(app),
    passportSocketIo = require('passport.socketio'),
    io = require('socket.io')(server),
    passport = require('./config/ppConfig'),
    ejsLayouts = require('express-ejs-layouts'),
    requestIp = require('request-ip'),
    flash = require('connect-flash'),
    MemoryStore = require('session-memory-store')(session),
    twitchBot = require('./chatBots/twitchBot.js'),
    beamBot = require('./chatBots/beamBot.js'),
    passport = require('./config/ppConfig')

// trick to keep heroku from lettings tweak-game-temp from idling

var http = require('http')
setInterval(function() {
    http.get('http://tweak-game-temp.herokuapp.com')
    console.log('keeping the app out of dorment mode')
}, 300000)

app.use(requestIp.mw())

app.use(cookieParser())
  
app.use(session({
  key: 'connect.sid', 
  secret: sessionSecret,
  // store: new MemoryStore(), // development 
  store: new (require('connect-pg-simple')(session))(), // production
  resave: false,
  saveUninitialized: false
}))

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,  
  key: 'connect.sid',     
  secret: sessionSecret,    
  // store: new MemoryStore(), // development
  store: new (require('connect-pg-simple')(session))(), // production
  success:      onAuthorizeSuccess, 
  fail:         onAuthorizeFail      
})) 

io.use(function(socket, next){
  if (socket.request.headers.cookie) return next()
  next(new Error('Authentication error'))
})

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io')
  accept()
}
 
function onAuthorizeFail(data, message, error, accept){
  if(error)  throw new Error(message)
  return accept()
}

app.use(flash())

app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

app.use(ejsLayouts)

app.use(morgan)

app.use(bodyParser.urlencoded({ extended: true }))

app.use(passport.initialize())

app.use(passport.session())

app.use(function(err, req, res, next) {
  console.log('error handler')
  if(err) {
    res.status(500)
    res.render('error', { error: 'There was an error.' })
  } else {
    next()
  }
})

app.locals.moment = require('moment')

app.use(function(req, res, next) {
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next()
})

var adminCtrl = require('./controllers/admin'),
    authCtrl = require('./controllers/auth'),
    giveawayCtrl = require('./controllers/giveaway'),
    playerCtrl = require('./controllers/player'),
    gameCtrl = require('./controllers/game'),
    userCtrl = require('./controllers/user'),
    aviCtrl = require('./controllers/avatar')
    testCtrl = require('./controllers/testUser'),
    auctionCtrl = require('./controllers/auction'),
    kiwiCtrl = require('./controllers/kiwi')

app.use('/admin', adminCtrl)
app.use('/player', playerCtrl)
app.use('/game', gameCtrl)
app.use('/giveaway', giveawayCtrl)
app.use('/auth', authCtrl)
app.use('/user', userCtrl)
app.use('/avatar', aviCtrl)
app.use('/testUser', testCtrl)
app.use('/auction', auctionCtrl)
app.use('/kiwi', kiwiCtrl)

var clients = []

io.on('connection', function(socket) {
  console.log(socket.request.user.dataValues)
  if(socket.request.user.dataValues.id) {
    var clientId = socket.request.user.dataValues.id,
        clientAuth = socket.request.user.dataValues.auth,
        clientName = socket.request.user.dataValues.username,
        tradeObject = {},
        lastTrader = null

    clients = clients.filter(function(obj) {
      return obj.id !== clientId
    })

    clients.push({
      id: clientId,
      socketId: socket.id,
      clientName: clientName,
      auth: clientAuth
    })

    console.log(clientName + ' connected')
    console.log(clients)
    
    io.emit('update players', clients)

    socket.on('disconnect', function() {
    
      clients = clients.filter(function(obj) {
        return obj.id !== clientId
      })

      io.emit('update players', clients)

      // clear any outstanding trades

      lastTrader = tradeObject.tradeInProgress

      var msg = 'cleared'
      
      console.log(clientId + ' dcd and was last trading with ' + lastTrader)
      
      var clearId = clients.filter(function(obj) {
        return obj.id === lastTrader
      })

      if(clearId.length) {
        console.log(clearId[0])
        socket.broadcast.to(clearId[0].socketId).emit('dc', msg)
      }
    })
  }

  socket.on('send trade', function(tradeObj) {
    tradeObject = tradeObj
    console.log('trade obj recieved from client ' + tradeObj.sentFromId)
    console.log(tradeObj)

    var socketId = clients.filter(function(obj) {
      return obj.id === tradeObj.tradeInProgress
    })
    if(socketId.length) {
      socket.broadcast.to(socketId[0].socketId).emit('get trade', tradeObj);
    }
  })

  socket.on('busy', function(trade) {
    var socketId = clients.filter(function(obj) {
      return obj.id === trade.sentFromId
    })
    var message = 'That trader is busy with another trade.'
    socket.broadcast.to(socketId[0].socketId).emit('busy', message); 
  })

  socket.on('accept trade', function(tradeObj) {
    var tradeObject = tradeObj
    console.log('this guy likes the trade conditions ' + tradeObject.sentFromId)

    var socketId = clients.filter(function(obj) {
      return obj.id === tradeObj.tradeInProgress
    })

    if(socketId.length) {
      socket.broadcast.to(socketId[0].socketId).emit('other trader accepted trade conditions', tradeObject);
    }    
  })

  socket.on('confirm trade', function(tradeObj) {
    var tradeObject = tradeObj
    console.log('this guy confirmed the trade conditions ' + tradeObject.sentFromId)

    var socketId = clients.filter(function(obj) {
      return obj.id === tradeObj.tradeInProgress
    })

    if(socketId.length) {
      socket.broadcast.to(socketId[0].socketId).emit('other trader finalized trade conditions', tradeObject);
    }    
  })
})

app.get('/', function(req, res) {
  var currentUser = false
  res.render('login', {currentUser: currentUser})
  // res.redirect('/testUser/login')
})

app.post('/login', passport.authenticate('local'),
  function(req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  console.log(req.isAuthenticated() + ' user authed with passport local')
  res.redirect('/auth/loggedIn')
})

app.get('/giveawayList', ensureAuthenticated, function(req, res) {  
  var user = req.user 
  db.giveaway.findAll({ order: '"updatedAt" DESC' }).then(function(giveaways) { 
    var giveaway = giveaways
    res.render('users/giveaways',
      {
        giveaways: giveaway,
        user: user
      }
    )
  })
})

app.get('/commandList', ensureAuthenticated, function(req, res) {
  res.render('commandList')
})

app.get('/profile/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.user.findById(id).then(function(user) {
    var user = user
    user.getContests().then(function(contests) {
      var contests = contests
      if(contests.length === 0) {
        contests = []
        res.render('profile', 
          {
            contests: contests,
            user: user
          }
        )
      } else {
        res.render('profile', 
          {
            contests: contests,
            user: user
          }
        )
      } 
    })
  })
})

app.get('/playerData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.user.findById(id).then(function(user) {
    var user = user
    res.send(user)
  })
})

app.get('/getContestWinners/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx
  db.giveaway.findById(id).then(function(giveaway) {
    giveaway.getWinners().then(function(winners) {
      res.send({winners: winners})
    })
  })
})

app.post('/keyPhrase/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx,
      clientKeyPhraseAttempt = req.body.keyphrase.toLowerCase(),
      reqUserId = req.user.id,
      reqUserName = req.user.username

  db.giveaway.findById(id).then(function(giveaway) {
    if(giveaway.ended) {
      req.flash('error', 'Giveaway ended.')
      res.redirect('back')
    } else {
      if(giveaway.keyphrase === clientKeyPhraseAttempt) {
        db.user.findById(reqUserId).then(function(user) {
          var userAdd = user,
              userIp = req.clientIp.toString()

          db.user.update({
            ip: userIp
          }, {
            where: {
              username: reqUserName
            }
          }).then(function(user) {
            giveaway.getUsers().then(function(users) {
              var users = users  
              users.forEach(function(user) {
                if(reqUserName === user.username) {
                  req.flash('error', 'You have already entered this giveaway.')
                  res.redirect('back')
                }
              })
              giveaway.addUser(userAdd)
              req.flash('success', 'You have entered the giveaway.')
              res.redirect('back')
            })
          })
        })
      } else {
        req.flash('error', 'Incorrect keyphrase.')
        res.redirect('back')
      }
    }
  })
})

server.listen(port)




