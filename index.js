var express = require('express'),
    app = express(),
    request = require('request'),
    morgan = require('morgan')('dev'),
    waterfall = require('async-waterfall'),
    ensureAuthenticated = require('./middleware/ensureAuth.js'),
    port = process.env.PORT || 3000,
    db = require('./models'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    ejsLayouts = require('express-ejs-layouts'),
    sessionSecret = process.env.SESSION,
    passport = require('./config/ppConfig'),
    errorhandler = require('errorhandler'),
    requestIp = require('request-ip'),
    tmi = require('tmi.js'),
    botKey = process.env.BOTAPIKEY,
    flash = require('connect-flash');
 
app.use(requestIp.mw());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(morgan);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(passport.session());

app.use(errorhandler());

app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

var adminCtrl = require('./controllers/admin'),
    authCtrl = require('./controllers/auth');

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
  client.action('bigbonesjones69', 'Hello world!');
});

client.on('chat', function(channel, userstate, message, self) {
  var messageUser = message.split(' '),
      messageTo,
      messageContent;

  if(messageUser[0] === '!giveaways') {
    db.giveaway.findAll().then(function(giveaways) {
      var giveawayList = '',
          giveaways = giveaways;
      console.log(giveaways)
      for(var i = 0; i <= giveaways.length; i++) {
        console.log(giveaways[i])
      }
      console.log(giveawayList)
      console.log('List of players ' + giveawayList)
      client.action('#tweakgames', giveawayList);
    });

  }

  switch(message) {
    case '!testbot':
      console.log(message);
       client.action('#tweakgames', 'This bot is ready to rock. I am not that useful yet.');
      break;
    case '!clear':
      client.clear("tweakgames");
      console.log(message);
      client.action('#tweakgames', 'Chat cleared.');
      break;
    default: console.log(message);     
  }



});

app.use('/admin', adminCtrl);

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





