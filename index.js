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
    errorhandler = require('errorhandler'),
    requestIp = require('request-ip'),
    tmi = require('tmi.js'),
    botKey = process.env.BOTAPIKEY,
    flash = require('connect-flash');

app.use(requestIp.mw());

app.use(cookieParser());
  
app.use(session({
  secret: sessionSecret,
  store: new (require('connect-pg-simple')(session))(),
  resave: false,
  saveUninitialized: false
}));

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express 
  key: 'connect.sid',       // the name of the cookie where express/connect stores its session_id 
  secret: sessionSecret,    // the session_secret to parse the cookie 
  store: new (require('connect-pg-simple')(session))(),        // we NEED to use a sessionstore. no memorystore please 
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below 
  fail:         onAuthorizeFail     // *optional* callback on fail/error - read more below 
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept();
};
 
function onAuthorizeFail(data, message, error, accept){
  if(error)  throw new Error(message);
  return accept();
};

app.use(flash());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(morgan);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(passport.session());

app.use(errorhandler());

app.locals.moment = require('moment');

app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

var adminCtrl = require('./controllers/admin'),
    authCtrl = require('./controllers/auth'),
    giveawayCtrl = require('./controllers/giveaway'),
    playerCtrl = require('./controllers/player'),
    gameCtrl = require('./controllers/game');

// twitch bot config

var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: 'bigbonesjones69',
    password: botKey
  },
  channels: ['#tweakgames']
};

var client = new tmi.client(options);
client.connect();

client.on('connected', function(address, port) {
  console.log('Address ' + address + ' port ' + port);
});

client.on('chat', function(channel, userstate, message, self) {
  var messageUser = message.split(' '),
      messageTo,
      messageContent;

  switch(message) {
    case '!testbot':
      client.action('#tweakgames', 'This bot is ready to rock. I am not that useful yet.');
      break;
    case '!clear':
      client.clear("tweakgames");
      client.action('#tweakgames', 'Chat cleared.');
      break;
    default: null     
  }
});

client.on('join', function (channel, username, self) {
  // Do your stuff.
});

var clients = [];

io.on('connection', function(socket) {
  // console.log(socket)
  console.log(socket.request.user.dataValues.username)
  var clientId = socket.request.user.dataValues.id,
      sendToId,
      clientName = socket.request.user.dataValues.username;
      tradeObject = {};

  clients = clients.filter(function(obj) {
    return obj.id !== clientId;
  });

  clients.push({
    id: clientId,
    socketId: socket.id,
    clientName: clientName
  });

  io.emit('updateList', clients);

  socket.on('clientSenderA', function(tradeObj) {

    tradeObject = tradeObj;
    console.log(tradeObject);
    var id = tradeObject.userId,
        result = clients.filter(function( obj ) {
          return obj.id == id;
        });

    if(result.length) {
      sendToId = result[0].socketId;
      socket.broadcast.to(sendToId).emit('get trade', tradeObject);
    } else {
      console.log('that user isnt logged on');
    };
    // else send message thclat player isnt online TODO
  });

  socket.on('Trade in progress', function(message) {
    var id = message.sentToId,
        result = clients.filter(function( obj ) {
          return obj.id == id;
        });

    if(result.length) {
      sendToId = result[0].socketId;
      socket.broadcast.to(sendToId).emit('trade busy', message.message);
    } else {
      console.log('that user isnt logged on');
    };
    // else send message that player isnt online TODO
  });

  socket.on('disconnect', function() {
    console.log('d/c event')
    var temp = tradeObject.sentFromId,
              sendToSocket;
    console.log('sent from ' + temp)

    tradeObject.gameId = [];
    tradeObject.sentFromId = clientId;
    tradeObject.sendTo = null;
    tradeObject.sentFromName = 'Came from clearing';
    tradeObject.clearThis = 'in';

    console.log(tradeObject)
    if (temp) {
      sendToSocket = clients.filter(function(obj) {
        return obj.id === temp;
      })
    }
    if (sendToSocket.length) {
      sendToSocket = sendToSocket[0].socketId; 
      console.log(clients)
      console.log(sendToSocket) 
      socket.broadcast.to(sendToSocket).emit('disconnect clear', tradeObject);
    }

    clients = clients.filter(function(obj) {
      return obj.id !== clientId;
    });

    io.emit('updateList', clients);
  });

});
 
app.use('/admin', adminCtrl);
app.use('/player', playerCtrl);
app.use('/game', gameCtrl);
app.use('/giveaway', giveawayCtrl);
app.use('/auth', authCtrl);

app.get('/', function(req, res) {
  var currentUser = false;
  res.render('login', {currentUser: currentUser});
});

app.get('/giveawayList', ensureAuthenticated, function(req, res) {
  var user = req.user;
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('users/giveaways',
      {
        giveaways: giveaway,
        user: user
      }
    );
  });
});

app.get('/profile/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
  db.user.findById(id).then(function(user) {
    var user = user;
    user.getContests().then(function(contests) {
      var contests = contests;
      if(contests.length === 0) {
        contests = [];
        res.render('profile', 
          {
            contests: contests,
            user: user
          }
        );
      } else {
        res.render('profile', 
          {
            contests: contests,
            user: user
          }
        );
      } 
    })
  });
});

app.get('/getContestWinners/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
  db.giveaway.findById(id).then(function(giveaway) {
    giveaway.getWinners().then(function(winners) {
      res.send({winners: winners});
    })
  });
});

app.post('/keyPhrase/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx,
      clientKeyPhraseAttempt = req.body.keyphrase.toLowerCase(),
      reqUserId = req.user.id,
      reqUserName = req.user.username;

  db.giveaway.findById(id).then(function(giveaway) {
    if(giveaway.ended) {
      req.flash('error', 'Giveaway ended.');
      res.redirect('back');
    } else {
      if(giveaway.keyphrase === clientKeyPhraseAttempt) {
        db.user.findById(reqUserId).then(function(user) {
          var userAdd = user,
              userIp = req.clientIp.toString();

          db.user.update({
            ip: userIp
          }, {
            where: {
              username: reqUserName
            }
          }).then(function(user) {
            giveaway.getUsers().then(function(users) {
              var users = users;  
              users.forEach(function(user) {
                if(reqUserName === user.username) {
                  req.flash('error', 'You have already entered this giveaway.');
                  res.redirect('back');
                }
              });
              giveaway.addUser(userAdd);
              req.flash('success', 'You have entered the giveaway.');
              res.redirect('back');
            });
          });
        });
      } else {
        req.flash('error', 'Incorrect keyphrase.');
        res.redirect('back');
      };
    };
  });
});

server.listen(port);




