var CronJob = require('cron').CronJob,
    db = require('../../models'),
    request = require('request')

var options = {
  url: 'https://beam.pro/api/v1/channels/tweakgames'
}

module.exports = function(userId) {
  var job = new CronJob({
    cronTime: '* */5 * * *',
    onTick: function() {
      db.kiwi.find({
        where: { userId: userId }
      }).then(function(kiwi) {
        console.log('kiwi found for this user')
        var currentKiwiPoints = kiwi.points + 1
        request(options, function(err, res, body) {
          if (!err && res.statusCode == 200) {
            console.log('beam request returned')
            var bodyParsed = JSON.parse(body)

            // if (bodyParsed.online === false) {
            //   console.log('homeboy is not logged on for you to watchn and gain points')
            //   job.stop()
            // } else {
              db.kiwi.find({
                where: {
                  userId: userId
                }
              }).then(function(user) {
                if (user.watching) {
                  db.kiwi.update({
                    points: currentKiwiPoints
                  }, {
                    where: {
                      userId: userId
                    }
                  }).then(function(kiwi) {
                    console.log('user still logged in and gaining points')
                  })
                } else {
                  console.log('the user stopped watching beam so they will stop gaining points')
                  job.stop()
                }
              })
            // }
          }
        })
      })
    },
    start: false,
    timeZone: 'America/Los_Angeles'
  })
  job.start()
}