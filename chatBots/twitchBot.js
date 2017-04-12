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
    case '!kiwis':
      console.log(userstate.username)
      var username = userstate.username
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
                .then(function(data) {
                  console.log(data)
                }).catch(function(err) {
                  console.log(err)
              })
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
    default: null     
  }
}

