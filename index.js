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
    twitchClientId = process.env.TWITCHCLIENTID,
    twitchClientSecret = process.env.CLIENTSECRETTWITCH,
    beamClientSecret = process.env.CLIENTSECRETBEAM,
    beamClientId = process.env.BEAMCLIENTID;
    console.log(twitchClientSecret + ' twitch');
    console.log(beamClientSecret + ' beam');
    console.log(beamClientId + ' beam id');
    console.log(twitchClientId + ' twitch id');



var TwitchtvStrategy = require('passport-twitchtv').Strategy;
var BeamStrategy = require('passport-beam').Strategy;
var passport = require('passport');

app.use(session({
  secret: 'asdasdasdasdas',
  resave: false,
  saveUninitialized: true
}));

passport.use(new TwitchtvStrategy({
  clientID: twitchClientId,
  clientSecret: twitchClientSecret,
  callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/twitch/callback',
  scope: 'user_read'
},
  function(accessToken, refreshToken, profile, done) {
    if(profile.username !== ('dridor' || 'tweakgames' || 'TweakGames')) {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    } else {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          admin: true
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    };
  }
));

passport.use(new BeamStrategy({
    clientID: beamClientId,
    clientSecret: beamClientSecret,
    callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/beam/callback',
    scope: 'user:details:self'
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('beam strat initiated')
     if(profile.username !== ('dridor' || 'tweakgames')) {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    } else {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          admin: true
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    };
  }
));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(morgan);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, cb) {
  var id = user.id;
  db.user.findById(id).then(function(user) {
    cb(null, user);
  }).catch(cb);
});

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/auth/twitch', 
  passport.authenticate('twitchtv'));

app.get('/auth/twitch/callback', 
  passport.authenticate('twitchtv',  { failureRedirect: '/' }), 
  function(req, res) {
  res.redirect('/auth/loggedIn');
});

app.get('/auth/beam',
  passport.authenticate('beam'));

app.get('/auth/beam/callback',
  passport.authenticate('beam', { failureRedirect: '/' }),
  function(req, res) {
  res.redirect('/auth/loggedIn');
});

app.get('/auth/loggedIn', function(req, res) {
  var user = req.user;
  if (req.user.admin) {
    res.render('adminControl', {user: user});
  } else {
    res.redirect('/giveawayList');
  }
});

app.post('/admin/adminListAdd', function(req, res) {
  db.user.update({
    admin: true
  }, {
    where: {
      username: req.body.adminNameGive
    }
  }).then(function(user) {
    res.redirect('/admin/adminList');
  });
});

app.post('/admin/adminListRemove', function(req, res) {
  var admin = Object.keys(req.body);
  var adminName = admin[0];
  console.log(adminName);
  console.log('-------')
  if(adminName === req.user.username) {
    res.send('You cannot demod yourself.');
  }
  db.user.update({
    admin: false
  }, {
    where: {
      username: adminName
    }
  }).then(function(user) {
    res.redirect('/admin/adminList');
  });
});

app.get('/giveawayList', function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('giveaways', {giveaways: giveaway});
  });  
});

app.get('/admin/adminList', function(req, res) {
  if(req.user.admin) {
    db.user.findAll({
      where: {
        admin: true
      }
    }).then(function(allAdmins) {
      var allAdmins = allAdmins;
      res.render('adminList', {allAdmins: allAdmins});
    });
  } else {
    res.redirect('/');
  }
});

app.post('/admin/adminGiveawayList', function(req, res) {
  if(req.user.admin) {
    db.giveaway.findOrCreate({
      where: {
        name: req.body.giveawayName,
        keyphrase: req.body.giveawayKeyPhrase
      },
      defaults: { players: [] }
    }).spread(function(giveaway, created) {
      res.redirect('/admin/adminGiveawayList');
    });
  } else {
    res.redirect('/');
  }
});

app.get('/admin/adminGiveawayList', function(req, res) {
  if(req.user.admin) {
    db.giveaway.findAll().then(function(giveaways) {
      var giveaway = giveaways;
      res.render('adminGameList', {giveaways: giveaway});
    });
  } else {
    res.redirect('/');
  }  
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

app.get('/giveawayHistory', function(req, res) {
  res.render('winHistory');
});

app.get('/deleteGiveaway/:idx', function(req, res) {
  if(req.user.admin) {
    var id = req.params.idx;
    db.giveaway.destroy({
      where: { id: id }
    }).then(function() {
    });
    res.redirect('/admin/adminGiveawayList');
  } else {
    res.redirect('/');
  }
});

app.get('/thanks', function(req, res) {
  res.render('thanks');
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





