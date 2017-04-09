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
              if(kiwi) {
                var kiwi = kiwi
                
                // console.log(kiwi)

                console.log('this kiwi was found attached to this user on beam ' + viewer)

                var currentKiwis = kiwi.points + 1

                db.kiwi.update({
                  points: currentKiwis,
                  watching: true
                }, {
                  where: {
                    userId: id
                  }
                })
                .then(function(kiwi) {
                  console.log('kiwi updated +1 for this viewer on beam' + viewer)
                  console.log(kiwi)
                })
  
              } else {
                console.log(viewer + ' does not have a kiwi account')
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
