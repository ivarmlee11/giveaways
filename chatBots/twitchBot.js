var tmi = require('tmi.js'),
  twitchBotKey = process.env.twitchBotKey,
  db = require('../models'),
  updateKiwisTwitch = require('./cronKiwiTimer/cronKiwiTimerTwitch.js')

// twitch bot config

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
  console.log('Address ' + address + ' port ' + port)
  console.log('starting the cron timer for twitch')
  updateKiwisTwitch()
})

client.on('chat', chat)

function chat(channel, userstate, message, self) {
  var messageUser = message.split(' '),
      messageTo,
      messageContent

  switch(message) {
    case '!testbot':
      client.action('#tweakgames', 'This bot is ready to rock. I am not that useful yet.')
      break
    case '!clear':
      client.clear('tweakgames')
      client.action('#tweakgames', 'Chat cleared.')
      break
    case '!kiwis':
      console.log(userstate.username)
      var username = userstate.username
      db.user.find({
        where: {
          username: username,
          auth: 'Twitch'
        }
      }).then(function(user) {
        user.getKiwi().then(function(kiwi) {
          if(kiwi) {
            var message = username + ' has ' + kiwi.points + ' kiwi points'
            client.action('#tweakgames', message)
              .then(function(data) {
                console.log(data)
              }).catch(function(err) {
                console.log(err)
            })
          } else {
            var message = username + ', make sure you are signed up the Tweak Games site.'
            client.action('#tweakgames', message)          
          }
        })
      })
    default: null     
  }
}

