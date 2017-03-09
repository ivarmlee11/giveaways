var CronJob = require('cron').CronJob,
    db = require('../../models'),
    request = require('request')

var request = require('request')
 
var options = {
  url: 'https://beam.pro/api/v1/channels/tweakgames'
}
 
function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('request module callback initd for beam')
    if(body.stream === null) {
      console.log('homeboy is not logged on beam')
      job.stop()
    }
  }
}

module.exports = function(userId) {
  var job = new CronJob({
    cronTime: '* */5 * * *',
    onTick: function() {
      db.kiwi.find({
        where: { userId: userId }
      }).then(function(kiwi) {
        console.log('kiwi found for this user')
        var currentKiwiPoints = kiwi.points + 50
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
                  console.log('the user stopped watching so they will stop gaining points')
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