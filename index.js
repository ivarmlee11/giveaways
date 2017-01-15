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
    passport = require('./config/ppConfig'),
    ejsLayouts = require('express-ejs-layouts'),
    errorhandler = require('errorhandler'),
    requestIp = require('request-ip'),
    tmi = require('tmi.js'),
    botKey = process.env.BOTAPIKEY,
    server  = require("http").createServer(app),
    io = require("socket.io")(server),
    flash = require('connect-flash'),
    sharedsession = require("express-socket.io-session");

server.listen(3000);
app.use(requestIp.mw());

app.use(cookieParser());

// 8 lines (7 sloc)  253 Bytes
// CREATE TABLE "session" (
//   "sid" varchar NOT NULL COLLATE "default",
//   "sess" json NOT NULL,
//   "expire" timestamp(6) NOT NULL
// )
// WITH (OIDS=FALSE);
// ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
var newSesh = {
  secret: sessionSecret,
  store: new (require('connect-pg-simple')(session))(),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 day
};

app.use(session(newSesh));

io.use(sharedsession(newSesh, {
    autoSave:true
})); 

io.on("connection", function(socket) {
    // Accept a login event with user's data
    console.log('what up')
    socket.on("login", function(userdata) {
        socket.handshake.session.userdata = userdata;
    });
    socket.on("logout", function(userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
        }
    });        
});

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
  // res.io = io;
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
    default: console.log(message);     
  }
});

client.on("join", function (channel, username, self) {
    // Do your stuff.
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
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('users/giveaways', {giveaways: giveaway});
  });
});

app.get('/profile/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
  db.user.findById(id).then(function(user) {
    user.getContests().then(function(contests) {
      var contests = contests;
      if(contests.length === 0) {
        contests = [];
        res.render('profile', {contests: contests});
      } else {
        res.render('profile', {contests: contests});
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

app.listen(port);
