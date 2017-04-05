var CronJob = require('cron').CronJob,
    db = require('../../models'),
    request = require('request'),
    beamRoomCheck = require('../roomCheck/beamRoomCheck')

var options = {
  url: 'https://beam.pro/api/v1/channels/tweakgames'
}

module.exports = function() {

console.log('cron job started for beam')

  var beamJob = new CronJob({
    cronTime: '*/5 * * * *',
    onTick: function() {
        
      request(options, function(err, res, body) {

        if (!err && res.statusCode == 200) {

          var bodyParsed = JSON.parse(body)

          if (!bodyParsed.online) {

            console.log('tweak is not streaming so users will not be gaining points via beam')

          } else {

            console.log('tweak is streaming on beam so we are running a room check for users of beam')
            beamRoomCheck()

          }
        }
      })
    },
    start: true,
    timeZone: 'America/Los_Angeles'
  })

}