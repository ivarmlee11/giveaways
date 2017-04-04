var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
		beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../models'),
    updateKiwisBeam = require('./cronKiwiTimer/cronKiwiTimerBeam.js')

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
      console.log('starting the cron timer for beam')
      updateKiwisBeam()
      // Send a chat message
      // return socket.call('msg', ['Hello world!'])
    })
    .catch(function(error) {
      console.log('Oh no! An error occurred! ', error)
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
            var message = sender + ', make sure you sign up on the Tweak Games site to start getting Kiwi coins.'
            socket.call('msg', [message])            
          }
        })
      break
    }
  })

  // Listen to socket errors, you'll need to handle these!
  socket.on('error', function(error) {
    console.error('Socket error', error)
  })
}


