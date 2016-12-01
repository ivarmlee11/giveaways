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
    passport = require('./config/ppConfig');

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(ejsLayouts);

app.use(morgan);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(passport.session());

// controllers
var adminCtrl = require('./controllers/admin');
app.use('/admin', adminCtrl);

var authCtrl = require('./controllers/auth');
app.use('/auth', authCtrl);

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/giveawayList', ensureAuthenticated, function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('giveaways', {giveaways: giveaway});
  });  
});

app.get('/showPlayersInGiveaway/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
    // use the join table to get all users associated with a giveaway of idx
    res.render('showGiveaway', {playerList: playerList});
});

app.get('/giveawayPlayerData/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx;
    // use join table to get all players associated with the req params id
    res.send({playerData: playerData});
});

app.get('/thanks', ensureAuthenticated, function(req, res) {
  res.render('thanks');
});

app.get('/alreadyEntered', ensureAuthenticated, function(req, res) {
  res.render('alreadyEntered');
});

app.post('/keyPhrase/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx,
      clientKeyPhraseAttempt = req.body.keyphrase.toLowerCase(),
      reqUserId = req.user.id;

  db.giveaway.findOrCreate({
    where: {
      id: id
    }
  }).spread(function(giveaway, created) {
    if(!created) {
      res.redirect('/alreadyEntered');
    } 
    db.user.findOrCreate({
      where: {id: reqUserId}
    }).spread(function(user, created) {
      console.log(user)
      giveaway.addUser(user);
      console.log('added this user to this giveaway ' + user);
      res.redirect('/thanks');
    });
  });

});

app.listen(port);





