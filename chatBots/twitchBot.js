var tmi = require('tmi.js'),
  twitchBotKey = process.env.twitchBotKey,
  db = require('../models'),
  updateKiwisTwitch = require('./cronKiwiTimer/cronKiwiTimerTwitch.js'),
  request = require('request'),
  dev = process.env.NODE_ENV

var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: 'kiwicopbot',
    password: twitchBotKey
  },
  channels: ['#tweakgames']
}

var client = new tmi.client(options)

var whisperClient = new tmi.client({
  connection: {
    random: 'group'
  },
  identity: {
    username: 'kiwicopbot',
    password: twitchBotKey
  }
})

client.connect()
whisperClient.connect()

client.on('connected', function(address, port) {
  console.log('Address ' + address + ' port ' + port + ' connected to twitch messaging service')
  console.log('starting the cron timer for twitch')
  updateKiwisTwitch()
})

client.on('chat', chat)
whisperClient.on('whisper', whisper)

function whisper(from, userstate, message, self) {
  var username = userstate.username,
      userId   = null,
      message = message

  console.log(message)
  console.log('whisper on twitch from ' + from)
  console.log('message is in money format ' + betIsCorrectCurrency(message))

  if(betIsCorrectCurrency(message)) {

    var firstCharacter = message.slice(0,1),
        bet

    if(firstCharacter === '$') {
      bet = message.slice(1, message.length)
      console.log(bet + ' $ was removed from the message, ' + message)
    } else {
      bet = message
    }

    var guessEndPoint

    if (dev === 'development') {
      guessEndPoint = 'http://localhost:3000/groceries/guessingPeriod/' + username + '/Twitch/' + message
    } else {
      guessEndPoint = 'https://tweak-game-temp.herokuapp.com/groceries/guessingPeriod/' + username + '/Twitch/' + message
    }

    var options = {
      url: guessEndPoint
    }

    request(options, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log(body)
        var msg = body
        client.whisper(from, msg)
      }
    })

  }

  switch(message) {
    case '!guessCheck':

      var myGuessEndPoint

      if (dev === 'development') {
        myGuessEndPoint = 'http://localhost:3000/groceries/guessingPeriod/' + username + '/Twitch/'
      } else {
        myGuessEndPoint = 'https://tweak-game-temp.herokuapp.com/groceries/guessingPeriod/' + username + '/Twitch/'
      }

      var urlOptions = {
        url: myGuessEndPoint
      }
      
      console.log(username + ' is checking their guess')

      request(urlOptions, function(err, res, body) {
        if (!err && res.statusCode == 200) {
          var message = body
          client.whisper(from, message) 
        }
      })

      break
    default: null     
  }
}

function chat(channel, userstate, message, self) {
  var username = userstate.username

  switch(message) {
    case '!kiwis':
      db.user.find({
        where: {
          username: username,
          auth: 'Twitch'
        }
      }).then(function(user) {
        if(user) {
          user.getKiwi().then(function(kiwi) {
            if(kiwi) {
              var message = username + ' has ' + kiwi.points + ' Kiwi Coins.'
              client.action('#tweakgames', message)
            } else {
              var message = username + ', please make sure to sign up or re-login to the Tweak Stream Site.'
              client.action('#tweakgames', message)          
            }
          })
        } else {
          var message = sender + ', sign up at Tweak\'s Gaming Stream Site to start getting Kiwi coins.'
          socket.call('msg', [message])            
        }
      })
      break 
    default: null     
  }
}

function betIsCorrectCurrency(str) {
  return str.search(/^\$?[\d,]+(\.\d*)?$/) >= 0 ? true : false
}

module.exports = client

