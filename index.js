var express = require('express'),
    app = express(),
    ejsLayouts = require('express-ejs-layouts'),
    request = require('request'),
    morgan = require('morgan')('dev'),
    waterfall = require('async-waterfall'),
    port = process.env.PORT || 3000,
    cors = require('cors'),
    // redirectUri = process.env.REDIRECT,
    clientSecret = process.env.CLIENTSECRET;



app.use(morgan);
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('login');
});

app.get('/twitch_oauth_endpoint', function(req, res) {
  var code = req.query.code;
  console.log(clientSecret)
  console.log('client secret')

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
          callback(null, accessToken);
      });
    },

    function(accessToken, callback) {
      var info = {};
      var options = {
        url: 'https://api.twitch.tv/kraken/user',
        headers: {
          'Accept': 'application/vnd.twitchtv.v3+json',
          'Authorization': 'OAuth ' + accessToken
        }
      };
      function success(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('type of body ', typeof body)
          info = JSON.parse(body);
          console.log(typeof info)
            callback(null, info);
        }
      }
      request(options, success);
      }
    ],
    function (err, info) {
      // result now equals 'done' 
      console.log(info + ' final result');
      var result = info;
      res.render('twitch/twitchEndpoint', {result: result});
    });

});

app.listen(port);