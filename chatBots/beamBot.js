var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
		beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../models'),
    updateKiwisBeam = require('./cronKiwiTimer/cronKiwiTimerBeam.js'),
    beamRoomCheck = require('./roomCheck/beamRoomCheck')

var userInfo

var client = new BeamClient()

client.use('oauth', {
  tokens: {
    access: beamBotKey,
    expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
  }
})

client.request('GET', 'users/current')
  .then(function(response) {

    userInfo = response.body

    return client.chat.join(tweakBeamId)
  })
  .then(function(response) {
    var body = response.body
    return createChatSocket(userInfo.id, tweakBeamId, body.endpoints, body.authkey)
  })
  .catch(function(err) {
    console.log(err)
  })

function createChatSocket(userId, channelId, endpoints, authkey) {

  // connect to chat

  var socket = new BeamSocket(endpoints).boot()

  socket.auth(channelId, userId, authkey)
    .then(function() {
      console.log('Beam bot authenticated!')
      // Send a chat message
      // return socket.call('msg', ['Hello world!'])
    })
    .catch(function(error) {
      console.log('Oh no! An error occurred! ', error)
    })

  socket.on('UserJoin', function(data) {

    console.log('user joined beam chat')
    console.log(data)
    var username = data.username

    if(username === ('tweakgames' || 'dridor')) {
      console.log('tweakgames logged in so we are going to check beam users for people who are not logged in')
      beamRoomCheck()
    }

    db.user.find({
      where: {
        username: username,
        auth: 'Beam'
      }
    }).then(function(user) {
      if(user) {
        var foundUsername = user.username
        console.log(foundUsername + ' user found on beam')
        user.getKiwi().then(function(kiwi) {
          if(kiwi) {  
          var id = kiwi.userId,
            points = kiwi.points
          console.log(id + ' userid of kiwi found')
          console.log(points + ' :points')
            db.kiwi.update({
              watching: true
            }, {
              where: {
                userId: id
              }
            }).then(function(kiwi) {
              console.log('running updateKiwisBeam')
              updateKiwisBeam(id)
            })
          } else {
            user.createKiwi({
              points: 0,
              watching: true
              // userId: user.id
            }).then(function(kiwi) {
              console.log('added kiwi object to this beam user and started adding kiwis to this user over time')
              console.log('running updateKiwisBeam')
              updateKiwisBeam(user.id)
            })
          }
        })
      } else {
        console.log(username + ' has not signed up for the web app via beam')
      }
    }) 
  })

  socket.on('ChatMessage', function(data) {
    var msg = data.message.message[0].text,
      sender = data.user_name

    switch (msg) { 
      case '!kiwis':
        db.user.find({
          where: {
            username: sender,
            auth: 'Beam'
          }
        }).then(function(user) {
          if(user) {
            user.getKiwi().then(function(kiwi) {
              var message = sender + ' has ' + kiwi.points + ' kiwi points'
              
              socket.call('msg', [message])
            })
          } else {
              var message = sender + ', make sure you sign up on the Tweak Games site to start getting Kiwi coins'
            socket.call('msg', [message])            
          }
        })
      break
    }
  })

  socket.on('UserLeave', function(data) {
    var data = data,
    username = data.username
    
    db.user.find({
      where: {
        username: username,
        auth: 'Beam'
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
          console.log(username + ' stopped watching from beam')
        })     
      } else {
        console.log('beam user left the beam chat that was not part of the web app ' + username)
      }    
    })
  })

  // Listen to socket errors, you'll need to handle these!
  socket.on('error', function(error) {
    console.error('Socket error', error)
  })
}


