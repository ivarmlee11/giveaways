var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
    beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../../models'),
    updateKiwisBeam = require('../cronKiwiTimer/cronKiwiTimerBeam.js')

module.exports = function() {  

  var client = new BeamClient()

  client.use('oauth', {
    tokens: {
      access: beamBotKey,
      expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    }
  })

  var url = '/chats/' + tweakBeamId + '/users'
  
  client.request('GET', url)
    .then(function(res) {
      console.log(res.body)
    })
    .then(function(res) {

    })
    .catch(function(err) {
      console.log(err)
    })

}
