var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
		beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    cronKiwiTimerBeam = require('./cronKiwiTimer/cronKiwiTimerBeam.js')

console.log('twitch stream id ' + tweakBeamId)


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
    // console.log(response.body)
    userInfo = response.body
    console.log(userInfo)

    return client.chat.join(tweakBeamId)
  })
  .then(function(response) {
    var body = response.body
    console.log(body)
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
      console.log('You are now authenticated!')
      // Send a chat message
      return socket.call('msg', ['Hello world!'])
    })
    .catch(function(error) {
      console.log('Oh no! An error occurred!', error)
    })

    // Listen to chat messages, note that you will also receive your own!
    socket.on('ChatMessage', function(data) {
      var msg = data.message.message[0].text,
        sender = data.user_name
      console.log('chat msg sent!')
      console.log(data)
      console.log(data.message)
      console.log(msg)
      console.log('from ' + sender)
      switch (msg) { 
        case '!kiwis':
        console.log('getting users')
        break;
      }
    })

    // Listen to socket errors, you'll need to handle these!
    socket.on('error', function(error) {
      console.error('Socket error', error)
    })
}


