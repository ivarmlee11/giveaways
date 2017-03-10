var CronJob = require('cron').CronJob,
		db = require('../../models'),
		request = require('request'),
		twitchClientId = process.env.TWITCHCLIENTID


var request = require('request')
 
var options = {
  url: 'https://api.twitch.tv/kraken/streams/tweakgames',
  headers: {
    'client-id': twitchClientId
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
	  		var currentKiwiPoints = kiwi.points + 1
	  		request(options, function(err, res, body) {
	  		  if (!err && res.statusCode == 200) {
				  	console.log('twitch request returned')
				  	var bodyParsed = JSON.parse(body)

				  	// if (bodyParsed.stream === null) {
				  	// 	console.log('homeboy is not logged on for you to watchn and gain points')
				  	// 	job.stop()
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