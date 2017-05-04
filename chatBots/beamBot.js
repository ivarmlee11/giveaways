var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
		beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../models'),
    updateKiwisBeam = require('./cronKiwiTimer/cronKiwiTimerBeam.js'),
    request = require('request'),
    dev = process.env.NODE_ENV

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
    console.log(body)
    createChatSocket(userInfo.id, tweakBeamId, body.endpoints, body.authkey)
    return null
  })
  .catch(function(err) {
    console.log(err)
    return err
  })

function createChatSocket(userId, channelId, endpoints, authkey) {
  var socket = new BeamSocket(endpoints).boot()

  socket.auth(channelId, userId, authkey)
    .then(function() {
      console.log('Beam bot authenticated!')
      console.log('starting the cron timer for beam')
      updateKiwisBeam()
    })
    .catch(function(error) {
      console.log('Oh no! An error occurred! ', error)
    })

  socket.on('ChatMessage', function(data) {
    var msg = data.message.message[0].text,
        sender = data.user_name,
        target = data.target,
        isWhisper = data.message.meta.whisper

    isWhisper ? console.log('this message is a whisper') : console.log('this message is not a whisper')
    console.log(msg)
    console.log('message on beam from ' + sender)
    console.log(data)

    if(!target) {
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
                if(!kiwi) {
                  var message = sender + ', please re-login at Tweak\'s Gaming Stream site to start getting Kiwi coins.'
                  socket.call('msg', [message])    
                } else {
                  var message = sender + ' has ' + kiwi.points + ' Kiwi coins.'
                  socket.call('msg', [message])
                }
              })
            } else {
              var message = sender + ', sign up at Tweak\'s Gaming Stream Site to start getting Kiwi coins.'
              socket.call('msg', [message])            
            }
          })
        break
      }
    } else if(target.toLowerCase() === 'kiwicopbotbeam') {

      if(betIsCorrectCurrency(msg)) {
        console.log(target + ' the target of this incoming whisper')
        console.log('message is in money format ' + betIsCorrectCurrency(msg))

        var firstCharacter = msg.slice(0,1),
            bet

        if(firstCharacter === '$') {
          bet = msg.slice(1, msg.length)
          console.log(bet + ' $ was removed from the message, ' + msg)
        } else {
          bet = msg
        }

        var guessEndPoint

        if (dev === 'development') {
          guessEndPoint = 'http://localhost:3000/groceries/guessingPeriod/' + sender + '/Beam/' + bet
        } else {
          guessEndPoint = 'https://tweak-game-temp.herokuapp.com/groceries/guessingPeriod/' + sender + '/Beam/' + bet
        }

        var options = {
          url: guessEndPoint,
          headers: {
            'verify': 'safe'
          }
        }

        request(options, function(err, res, body) {
          if (!err && res.statusCode == 200) {
            var message = body
            socket.call('whisper', [sender, message])
          }
        })
      } else {
        console.log(target + ' the target of this incoming whisper')
        console.log('message is in money format ' + betIsCorrectCurrency(msg))

        switch(msg) {
          case '!guessCheck':

            var myGuessEndPoint

            if (dev === 'development') {
              myGuessEndPoint = 'http://localhost:3000/groceries/guessingPeriod/' + sender + '/Beam/'
            } else {
              myGuessEndPoint = 'https://tweak-game-temp.herokuapp.com/groceries/guessingPeriod/' + sender + '/Beam/'
            }

            var options = {
              url: guessEndPoint,
              headers: {
                'verify': 'safe'
              }
            }
            
            console.log(sender + ' is checking their guess')

            request(urlOptions, function(err, res, body) {
              if (!err && res.statusCode == 200) {
                var message = body
                socket.call('whisper', [sender, message])
              }
            })

            break
          default: null     
        }
      }
    }
  })

  socket.on('error', function(error) {
    console.error('Socket error', error)
    console.log(error.message)
  })
}

function betIsCorrectCurrency(str) {
  return str.search(/^\$?[\d,]+(\.\d*)?$/) >= 0 ? true : false
}

module.exports = client

