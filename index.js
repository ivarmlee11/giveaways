var express = require('express'),
    app = express(),
    request = require('request'),
    morgan = require('morgan')('dev'),
    waterfall = require('async-waterfall'),
    port = process.env.PORT || 3000,
    db = require('./models'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    ejsLayouts = require('express-ejs-layouts'),
    sessionSecret = process.env.SESSION,
    passport = require('./config/ppConfig');

// controllers
var adminCtrl = require('./controllers/admin');
app.use('/admin', adminCtrl);

var authCtrl = require('./controllers/auth');
app.use('/auth', authCtrl);

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());

app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(morgan);

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/giveawayList', function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('giveaways', {giveaways: giveaway});
  });  
});

app.get('/giveawayData', function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveawayArray = [];
    giveaways.forEach(function(value) {
      giveawayArray.push(value);
    });
    res.send(giveawayArray);
  });  
});

app.get('/playerList/:idx', function(req, res) {
  var id = req.params.idx;
  db.giveaway.findById(id).then(function(giveaway) {
    var playerList = giveaway.players;
    res.render('showGiveaway', {playerList: playerList});
  });
});

app.get('/winner/:idx', function(req, res) {
  var id = req.params.idx;
  db.giveaway.findById(id).then(function(giveaway) {
    var playerList = giveaway.players;
    res.send({playerList: playerList});
  });
});

app.get('/thanks', function(req, res) {
  res.render('thanks');
});

app.get('/giveawayHistory', function(req, res) {
  res.render('winHistory');
});

app.get('/giveaway/:idx', function(req,res) {
  var giveawayId = req.params.idx;  
  waterfall([
    function(callback){
      db.giveaway.find({
        where: {
          id: giveawayId
        }
      }).then(function(giveaway) {
        var players = giveaway.players;
        callback(null, players);
      });
    },
    function(players, callback){
      var players = players,
          playerObj = {};

      if(!players) {
        players = [];
      }
      players.push(req.user.username);

      players.forEach(function(player) {
        playerObj[player] = player;
      });

      playersUnique = [];

      Object.keys(playerObj).forEach(function(key,index) {
        playersUnique.push(key);
      });

      db.giveaway.update({
        players: playersUnique
      }, {
        where: {
          id: giveawayId
        }
      }).then(function(updatedPlayers) {
        callback(null, updatedPlayers);
      });
    }
  ],
  function (err, result) {
    res.redirect('/thanks');
  });
});

app.listen(port);





