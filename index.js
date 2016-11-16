var express = require('express'),
    app = express(),
    ejsLayouts = require('express-ejs-layouts'),
    request = require('request'),
    morgan = require('morgan')('dev'),
    waterfall = require('async-waterfall'),
    port = process.env.PORT || 3000,
    // redirectUri = process.env.REDIRECT,
    clientSecret = process.env.twitch_client_secret;



app.use(morgan);
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/twitch_oauth_endpoint', function(req, res) {
  var code = req.query.code;

  waterfall([
  function(callback){
    var accessToken;
    request.post({
      url:'https://api.twitch.tv/kraken/oauth2/token',
      form: {
            client_id: 'cvmjz4nnl2lh1f30abf9hvgedsg6q6u',
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: 'https://tweak-game-temp.herokuapp.com/twitch_oauth_endpoint',
            code: code
          }
      }, 
      function(err, httpResponse, body) {
        var body = JSON.parse(body),
        accessToken = body.access_token;
        console.log(body)
        console.log(accessToken + ' first call back');
        callback(null, accessToken);
    });

  },
  function(accessToken, callback) {
      callback(null, accessToken);
    }
  ], function (err, result) {
    // result now equals 'done' 
    console.log(result + ' final result');
    var result = result;
    res.render('twitch/twitchEndpoint', {result: result});
  });

});

app.listen(port);