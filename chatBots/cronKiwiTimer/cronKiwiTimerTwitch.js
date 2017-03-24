var CronJob = require('cron').CronJob,
		db = require('../../models'),
		request = require('request'),
		twitchClientId = process.env.TWITCHCLIENTID
 
var options = {
  url: 'https://api.twitch.tv/kraken/streams/tweakgames',
  headers: {
    'client-id': twitchClientId
  }
}
 
module.exports = function(userId) {
	var job = new CronJob({
	  cronTime: '* */1 * * *',
	  onTick: function() {

      console.log(userId + ' running a twitch cron timer for this guy')

	  	db.kiwi.find({
	  		where: { userId: userId }
	  	}).then(function(kiwi) {

        var currentKiwiPoints = kiwi.points + 1

        console.log('kiwi found for this user on twitch ' + currentKiwiPoints)

        console.log('twitch request sent')
        
        request(options, function(err, res, body) {

	  		  if (!err && res.statusCode == 200) {

				  	console.log('twitch request returned')

				  	var bodyParsed = JSON.parse(body)

            console.log(bodyParsed)

				  	if (!bodyParsed.stream) {

				  		console.log('homeboy is not logged on for you to watch and gain points via twitch')

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
              }, {
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