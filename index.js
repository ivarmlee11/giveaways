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
    requestIp = require('request-ip');
 
app.use(requestIp.mw())

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

app.use(errorhandler());

// controllers
var adminCtrl = require('./controllers/admin');
app.use('/admin', adminCtrl);

var authCtrl = require('./controllers/auth');
app.use('/auth', authCtrl);
//

app.get('/', function(req, res) {
  console.log(req.clientIp + ' for this user ' + req.user.username);
  res.render('login');
});

app.get('/giveawayList', ensureAuthenticated, function(req, res) {
  db.giveaway.findAll().then(function(giveaways) {
    var giveaway = giveaways;
    res.render('giveaways', {giveaways: giveaway});
  });
});

app.get('/thanks', ensureAuthenticated, function(req, res) {
  res.render('thanks');
});

app.get('/alreadyEntered', ensureAuthenticated, function(req, res) {
  res.render('alreadyEntered');
});

app.get('/wrongPass', ensureAuthenticated, function(req, res) {
  res.render('wrongPass');
});

app.get('/giveawayOver', ensureAuthenticated, function(req, res) {
  res.render('giveawayOver');
});

app.post('/keyPhrase/:idx', ensureAuthenticated, function(req, res) {
  var id = req.params.idx,
      clientKeyPhraseAttempt = req.body.keyphrase.toLowerCase(),
      reqUserId = req.user.id,
      reqUserName = req.user.username;

  db.giveaway.findById(id).then(function(giveaway) {
    console.log('found giveaway ' + giveaway.name);

    if(giveaway.ended) {
      res.redirect('/giveawayOver');
    } else {
      if(giveaway.keyphrase === clientKeyPhraseAttempt) {
        db.user.findById(reqUserId).then(function(user) {
          var userIp = req.clientIp.toString();
          db.user.update({
            ip: userIp
          }, {
            where: {
              username: req.user.username
            }
          }).then(function(user) {
            giveaway.getUsers().then(function(users) {
            var users = users;  
            users.forEach(function(user) {
              if(reqUserName === user.username) {
                res.redirect('/alreadyEntered');
              }
            });
            giveaway.addUser(user);
            res.redirect('/thanks');
            });
          });
        });
      } else {
        res.redirect('/wrongPass');
      };
    };

  });



});

app.listen(port);





