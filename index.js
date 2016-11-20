var express = require('express'),
    app = express(),
    request = require('request'),
    morgan = require('morgan')('dev'),
    waterfall = require('async-waterfall'),
    port = process.env.PORT || 3000,
    db = require('./models'),
    bodyParser = require('body-parser'),
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

passport.use(new TwitchtvStrategy({
  clientID: twitchClientId,
  clientSecret: twitchClientSecret,
  callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/twitch/callback',
  scope: 'user_read'
},
  function(accessToken, refreshToken, profile, done) {
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/', function(req, res) {
  res.render('login');
});

var user;

app.get('/auth/twitch', 
  passport.authenticate('twitchtv'));

app.get('/auth/twitch/callback', 
  passport.authenticate('twitchtv',  { failureRedirect: '/' }), 
  function(req, res) {
  user = req.user;
  console.log(req.isAuthenticated());
  res.redirect('/auth/loggedIn');
});

app.get('/auth/beam',
  passport.authenticate('beam'));

app.get('/auth/beam/callback',
  passport.authenticate('beam', { failureRedirect: '/' }),
  function(req, res) {
  user = req.user;
  console.log(req.isAuthenticated());
  res.redirect('/auth/loggedIn');
});

app.get('/auth/loggedIn', function(req, res) {
  if(user) {
    if (user.admin) {
      res.render('makeGame', {user: user});
    } else {
      res.redirect('/giveawayList');
    }
  } else {
    res.redirect('/');
  }
});

app.get('/giveawayList', function(req, res) {
  if(user) {
    db.giveaway.findAll().then(function(giveaways) {
      var giveaway = giveaways;
      res.render('giveaways', {giveaways: giveaway});
    });  
  } else {
    res.redirect('/');
  }
});

app.post('/admin/makeGame', function(req, res) {
  db.giveaway.findOrCreate({
    where: {
      name: req.body.giveawayName
    },
    defaults: { players: [] }
  }).spread(function(giveaway, created) {
    res.redirect('/admin/adminControl');
  });
});

app.get('/admin/adminControl', function(req, res) {
  if(user) {
    db.giveaway.findAll().then(function(giveaways) {
      var giveaway = giveaways;
      res.render('adminControl', {giveaways: giveaway});
    });
  } else {
    res.redirect('/');
  }  
});

app.get('/playerList/:idx', function(req, res) {
  if(user) {
  var id = req.params.idx;
  db.giveaway.findById(id).then(function(giveaway) {
    var playerList = giveaway.players;
    res.render('showGiveaway', {playerList: playerList});
  });
  } else {
    res.redirect('/');
  }
});

app.get('/winner/:idx', function(req, res) {
  if (user) { 
    var id = req.params.idx;
    db.giveaway.findById(id).then(function(giveaway) {
      var playerList = giveaway.players;
      res.send({playerList: playerList});
    });
  } else {
    res.redirect('/');
  }
});

app.get('/giveawayHistory', function(req, res) {
  if(user) {
    db.giveawayhistory.findAll().then(function(giveaways) {
      var giveaways = giveaways;
      res.send({giveaways: giveaways});
    });  
  } else {
    res.redirect('/');
  }
});

app.get('/deleteGiveaway/:idx', function(req, res) {
  if(user) {
    var id = req.params.idx;
    db.giveaway.destroy({
      where: { id: id }
    }).then(function() {
    });
    res.redirect('/admin/adminControl');
  } else {
    res.redirect('/');
  }
});

app.get('/thanks', function(req, res) {
  if(user) {
    res.render('thanks');
  } else {
    res.redirect('/');
  }
});

app.get('/giveaway/:idx', function(req,res) {
  if(user) {
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
        players.push(user.username);

        players.forEach(function(player) {
          playerObj[player] = player;
        });

        players = [];

        Object.keys(playerObj).forEach(function(key,index) {
          players.push(key);
        });

        db.giveaway.update({
          players: players
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
  } else {
    res.redirect('/');
  }
});

app.listen(port);





