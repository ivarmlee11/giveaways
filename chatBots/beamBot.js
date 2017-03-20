var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
		beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../models'),
    updateKiwisTwitch = require('./cronKiwiTimer/cronKiwiTimerBeam.js')

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
    // console.log(userInfo)

    return client.chat.join(tweakBeamId)
  })
  .then(function(response) {
    var body = response.body
    // console.log(body)
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
      return socket.call('msg', ['Hello world!'])
    })
    .catch(function(error) {
      console.log('Oh no! An error occurred!', error)
    })

     socket.on('UserJoin', function(data) {
      var username = data.username
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
            var id = kiwi.userId
            console.log(id + ':userid of kiwi found')
              db.kiwi.update({
                watching: true
              }, {
                where: {
                  userId: id
                }
              }).then(function(kiwi) {
                updateKiwisTwitch(id)
              })
            } else {
              user.createKiwi({
                points: 0,
                watching: true,
                userId: user.id
              }).then(function(kiwi) {
                console.log('added kiwi object and started adding kiwis to this user over time')
                updateKiwisTwitch(user.id)
              })
            }
          })
        } else {
          console.log(username + ' has not signed up for the web app via beam')
        }
      }) 
    })

    // Listen to chat messages, note that you will also receive your own!
    socket.on('ChatMessage', function(data) {
      var msg = data.message.message[0].text,
        sender = data.user_name
      console.log('chat msg sent on beam!')
      // console.log(data)
      // console.log(data.message)
      console.log(msg)
      console.log('from ' + sender)
      switch (msg) { 
        case '!kiwi':
          console.log('kiwi check incoming')
        break
      }
    })

    socket.on('UserLeave', function(data) {
      var data = data
      console.log(data)
      var username = data.username
      console.log(username + ' has left the beam channel')
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
            console.log(username + ' stopped watching')
          })     
        } else {
          console.log('user left the beam chat that was not part of the web app; ' + username)
        }    
      })
    })

    // Listen to socket errors, you'll need to handle these!
    socket.on('error', function(error) {
      console.error('Socket error', error)
    })
}


