var tmi = require('tmi.js'),
  twitchBotKey = process.env.twitchBotKey,
  db = require('../models'),
  updateKiwisTwitch = require('./cronKiwiTimer/cronKiwiTimerTwitch.js'),
  twitchRoomCheck = require('./roomCheck/twitchRoomCheck')

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
            var message = username + ', make sure you are signed up the Tweak Games site'
            client.action('#tweakgames', message)          
          }
        })
      })
    default: null     
  }
}

client.on('join', join)

function join (channel, username, self) {
  console.log(username + ' joined channel ' + channel)

  if(username === 'dridor') {
    console.log('dridor logged on to twitch so we are going to turn all idle viewers into watchers')
    twitchRoomCheck()
  }
  db.user.find({
    where: {
      username: username,
      auth: 'Twitch'
    }
  }).then(function(user) {
    if(user) {
      var foundUsername = user.username
      console.log(foundUsername + ' user found')
      user.getKiwi().then(function(kiwi) {
        if(kiwi) {  
          var id = kiwi.userId
          console.log(username + ' kiwi found for this twitch user')
          db.kiwi.update({
            watching: true
          }, {
            where: {
              userId: id
            }
          }).then(function(kiwi) {
            console.log('running updateKiwisTwitch')
            updateKiwisTwitch(id)
          })
        } else {
          user.createKiwi({
            points: 0,
            watching: true
            // userId: user.id
          }).then(function(kiwi) {
            console.log(username + ' added kiwi object and started adding kiwis to this user over time')
            console.log('running updateKiwisTwitch')
            updateKiwisTwitch(user.id)
          })
        }
      })
    } else {
      console.log(username + ', a twitch user, has not signed up for the web app')
    }
  })  
}

client.on('part', part)

function part(channel, username, self) {

  db.user.find({
    where: {
      username: username,
      auth: 'Twitch'
    }
  }).then(function(user) {
    if(user) {
      db.kiwi.update({
        watching: false
      }, {
        where: {
          userId: user.id
        }
      }).then(function(kiwi) {
        console.log(username + ' stopped watching from twitch')
      })     
    } else {
      console.log('twitch user left that was not part of the web app ' + username)
    }    
  })
}

module.exports = client