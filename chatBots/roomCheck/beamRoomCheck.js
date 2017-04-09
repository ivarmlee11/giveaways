var BeamClient = require('beam-client-node'),
    BeamSocket = require('beam-client-node/lib/ws'),
    beamBotKey = process.env.BEAMBOTKEY,
    tweakBeamId = process.env.tweakBeamId,
    db = require('../../models')

module.exports = function() {  

  var client = new BeamClient()

  client.use('oauth', {
    tokens: {
      access: beamBotKey,
      expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    }
  })

  var url = '/chats/' + tweakBeamId + '/users'

  var viewers = []
  
  client.request('GET', url)
    .then(function(res) {
      res.body.forEach(function(viewer) {
        viewers.push(viewer.userName)
      })

      console.log('list of all mods and viewers in beam')
      console.log(viewers)

      viewers.forEach(function(viewer) {
        db.user.find({
          where: {
            username: viewer,
            auth: 'Beam'
          }
        }).then(function(user) {
          if(user) {
            var id = user.id
            user.getKiwi().
              then(function(kiwi) {
              var kiwi = JSON.parse(kiwi)
              
              console.log(kiwi)

              console.log('this kiwi was found attached to this user on beam ' + viewer)

              var currentKiwis = kiwi.points + 1

              if(!kiwi.watching) {
                db.kiwi.update({
                  points: currentKiwis,
                  watching: true
                }, {
                  where: {
                    id: id
                  }
                })
                .then(function(kiwi) {
                  console.log('kiwi watching status changed to true for ' + viewer)
                
                })
              } else {
                console.log(viewer + ', a beam user, already has a kiwi that has a watching status of true')
              }
            })
          } else {
            console.log('tweakgames logged on to beam so a viewer check was run. this viewer does not have an account with my site ' + viewer)
          }
        })
      })


    })
    .catch(function(err) {
      console.log(err)
    })

}
