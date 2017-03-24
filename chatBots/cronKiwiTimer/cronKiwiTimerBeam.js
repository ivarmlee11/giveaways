var CronJob = require('cron').CronJob,
    db = require('../../models'),
    request = require('request')

var options = {
  url: 'https://beam.pro/api/v1/channels/tweakgames'
}

module.exports = function(userId) {
  var job = new CronJob({
    cronTime: '* */1 * * *',
    onTick: function() {

      db.kiwi.find({
        where: { userId: userId }
      }).then(function(kiwi) {

        var currentKiwiPoints = kiwi.points + 1

        console.log('kiwi found for this user + ' currentKiwiPoints)

        request(options, function(err, res, body) {
          
          console.log('beam request sent')

          if (!err && res.statusCode == 200) {

            console.log('beam request returned')
            var bodyParsed = JSON.parse(body)
            console.log(bodyParsed)

            if (!bodyParsed.online) {

              console.log('homeboy is not logged on for you to watch and gain points via beam')
              db.kiwi.update({
                watching: false
              }, {
                where: {
                  userId: userId
                }
              }).then(function(kiwi) {
                job.stop()
              })

            } else {
              console.log(userId + ' is going to get some points because they are logged on and watching tweak stream ' + currentKiwiPoints)

              db.kiwi.update({
                watching: true,
                points: currentKiwiPoints
              } , {
                where: {
                  userId: userId
                }
              }).then(function(kiwi) {
                console.log(kiwi)
              })

            }
          }
        })
      })
    },
    start: false,
    timeZone: 'America/Los_Angeles'
  })
  job.start()
}