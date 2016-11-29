var TwitchtvStrategy = require('passport-twitchtv').Strategy,
    BeamStrategy = require('passport-beam').Strategy,
    db = require('../models'),
    passport = require('passport'),
    twitchClientId = process.env.TWITCHCLIENTID,
    twitchClientSecret = process.env.CLIENTSECRETTWITCH,
    beamClientSecret = process.env.CLIENTSECRETBEAM,
    beamClientId = process.env.BEAMCLIENTID;
    console.log(twitchClientSecret + ' twitch');
    console.log(beamClientSecret + ' beam');
    console.log(beamClientId + ' beam id');
    console.log(twitchClientId + ' twitch id');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, cb) {
  var id = user.id;
  db.user.findById(id).then(function(user) {
    cb(null, user);
  }).catch(cb);
});

passport.use(new TwitchtvStrategy({
    clientID: twitchClientId,
    clientSecret: twitchClientSecret,
    callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/twitch/callback',
    scope: 'user_read'
  },
  function(accessToken, refreshToken, profile, done) {
    if(profile.username !== 'tweakgames') {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          auth: 'Twitch'
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    } else {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          auth: 'Twitch',
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
    if(profile.username !== 'TweakGames') {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          auth: 'Beam'
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    } else {
      db.user.findOrCreate({
        where: {
          twitchid: profile.id,
          username: profile.username,
          auth: 'Beam',
          admin: true
        }
      }).spread(function(user, created) {
        return done(null, user);
      });
    };
  }
));

module.exports = passport;