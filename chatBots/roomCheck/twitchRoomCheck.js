  var request = require('request'),
    db = require('../../models')

module.exports = function() {

  request('https://tmi.twitch.tv/group/user/tweakgames/chatters', function (err, res, body) {

    console.log('checking twitch viewer list')

    if(err) {
      console.log(err)
      return
    }

    if (!err && res.statusCode == 200) {
      var chatObj = JSON.parse(body)
      console.log(chatObj)

      var currentViewers = []

      chatObj.chatters.moderators.forEach(function(viewer) {
        currentViewers.push(viewer)
      })

      chatObj.chatters.viewers.forEach(function(viewer) {
        currentViewers.push(viewer)
      })

      console.log('list of all mods and viewers in twitch')
      console.log(currentViewers)

      currentViewers.forEach(function(viewer) {
        db.user.find({
          where: {
            username: viewer,
            auth: 'Twitch'
          }
        }).then(function(user) {
          if(user) {
            var id = user.id
            user.getKiwi().
              then(function(kiwi) {
              if(kiwi) {
                var kiwi = kiwi
                console.log(kiwi)
                console.log('this kiwi was found attached to this user on twitch ' + viewer)

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
                    console.log('kiwi points updated for this user on twitch ' + viewer + ' points: ' + kiwi.points)
                  })
                } else {
                  console.log(viewer + ', a twitch user, already has a kiwi that has a watching status of true')
                }
              } else {
                console.log(viewer + ' does not have a kiwi account')
              }
            })
          } else {
            console.log('this viewer does not have an account with my site via twitch ' + viewer)
          }
        })
      })
    }
  })
}