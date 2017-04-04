var CronJob = require('cron').CronJob,
		db = require('../../models'),
		request = require('request'),
		twitchClientId = process.env.TWITCHCLIENTID,
    twitchRoomCheck = require('../roomCheck/twitchRoomCheck')
 
var options = {
  url: 'https://api.twitch.tv/kraken/streams/tweakgames',
  headers: {
    'client-id': twitchClientId
  }
}
 
module.exports = function() {

 console.log('cron job started for twitch')

  var job = new CronJob({
	  cronTime: '*/5 * * * *',
	  onTick: function() {
  
      request(options, function(err, res, body) {

  		  if (!err && res.statusCode == 200) {

			  	var bodyParsed = JSON.parse(body)

			  	if (!bodyParsed.stream) {

			  		console.log('tweak is not streaming so users will not be gaining points via twitch')

					} else {

            console.log('viewers currently logged into tweaks channel will gain points while tweak is streaming on twitch')
            twitchRoomCheck()

					}
				}
      })
	  },
	  start: true,
	  timeZone: 'America/Los_Angeles'
	})

}