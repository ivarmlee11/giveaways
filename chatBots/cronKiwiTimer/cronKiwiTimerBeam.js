var CronJob = require('cron').CronJob,
    db = require('../../models'),
    request = require('request')

var options = {
  url: 'https://beam.pro/api/v1/channels/tweakgames'
}

module.exports = function(userId) {
  console.log(userId + ' running a beam cron timer for this guy')
  
  var beamJob = new CronJob({
    cronTime: '* */5 * * *',
    onTick: function() {

      console.log(userId + ' running a beam cron timer for this guy and i hit the 5 min mark')

      db.kiwi.find({
        where: { userId: userId }
      }).then(function(kiwi) {

        var currentKiwiPoints = kiwi.points + 1

        console.log('kiwi found for this user on beam ' + currentKiwiPoints)

        console.log('beam request sent')
        
        request(options, function(err, res, body) {

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
                job.beamJob()
              })

            } else {
              console.log(userId + ' userId is still getting points while watching on beam. this many points... ' + currentKiwiPoints)

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