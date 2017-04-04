var TwitchtvStrategy = require('passport-twitchtv').Strategy,
    BeamStrategy = require('passport-beam').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    db = require('../models'),
    passport = require('passport'),
    twitchClientId = process.env.TWITCHCLIENTID,
    twitchClientSecret = process.env.CLIENTSECRETTWITCH,
    beamClientSecret = process.env.CLIENTSECRETBEAM,
    beamClientId = process.env.BEAMCLIENTID

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, cb) {
  var id = id
  db.user.findById(id).then(function(user) {
    cb(null, user)
  }).catch(cb)
})

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function(username, password, cb) {
  db.user.find({
    where: { username: username }
  }).then(function(user) {
    if (!user || !user.validPassword(password)) {
      cb(null, false)
    } else {
      cb(null, user)
    }
  }).catch(cb)
}))

passport.use(new TwitchtvStrategy({
    clientID: twitchClientId,
    clientSecret: twitchClientSecret,
    callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/twitch/callback',
    scope: 'user_read'
  },
  function(accessToken, refreshToken, profile, done) {
    if(profile.username === ('tweakgames')) {
      db.user.findOrCreate({
        where: {
          userid: profile.id,
          username: profile.username,
          auth: 'Twitch',
          admin: true
        }
      }).spread(function(user, created) {
        return done(null, user)
      })
    } else {
      db.user.findOrCreate({
        where: {
          userid: profile.id,
          username: profile.username,
          auth: 'Twitch'
        }
      }).spread(function(user, created) {
        var id
        if(created) {
          console.log('user created')
          console.log(created)
          console.log(user)
        } else {
          console.log('user logged in')
          console.log(user)
        }
        
        db.kiwi.find({
          where: {
            userId: profile.id
          }
        }).then(function(kiwi) {
          if(!kiwi) {
            console.log(user.username + ' does not have a kiwi account')
            user.createKiwi({
              points: 0,
              userId: id
            })
            .then(function(kiwi) {
              console.log('kiwi created for ' + user.username)
              return done(null, user)      
            })
          }
        })
      })
    }
  }
))

passport.use(new BeamStrategy({
    clientID: beamClientId,
    clientSecret: beamClientSecret,
    callbackURL: 'https://tweak-game-temp.herokuapp.com/auth/beam/callback',
    scope: 'user:details:self'
  },
  function(accessToken, refreshToken, profile, done) {
    if(profile.username === ('TweakGames')) {
      db.user.findOrCreate({
        where: {
          userid: profile.id,
          username: profile.username,
          auth: 'Beam',
          admin: true
        }
      }).spread(function(user, created) {
        return done(null, user)
      })
    } else {
      db.user.findOrCreate({
        where: {
          userid: profile.id,
          username: profile.username,
          auth: 'Beam'
        }
      }).spread(function(user, created) {
        db.kiwi.find({
          where: {
            userId: profile.id
          }
        }).then(function(kiwi) {
          if(!kiwi) {
            console.log(user.username + ' does not have a kiwi account')
            user.createKiwi({
              points: 0,
              userId: id
            })
            .then(function(kiwi) {
              console.log('kiwi created for ' + user.username)
              return done(null, user)      
            })
          }
        })
      })
    }
  }
))

module.exports = passport