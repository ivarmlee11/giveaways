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

	console.log(userId + ' running a twitch cron timer for this guy')

  var job = new CronJob({
	  cronTime: '* */1 * * *',
	  onTick: function() {

	  	db.kiwi.find({
	  		where: { userId: userId }
	  	}).then(function(kiwi) {

        if(kiwi.watching === false) {
          job.stop()
        }

        var currentKiwiPoints = kiwi.points + .20

        console.log('kiwi found for this user on twitch ' + currentKiwiPoints)

        console.log('twitch request sent')
        
        request(options, function(err, res, body) {

	  		  if (!err && res.statusCode == 200) {

				  	console.log('twitch request returned')

				  	var bodyParsed = JSON.parse(body)

            console.log('body parsed stream ' + bodyParsed.stream)

				  	if (!bodyParsed.stream) {

				  		console.log('homeboy is not logged on for you to watch and gain points via twitch')

              db.kiwi.update({
                watching: false
              }, {
                where: {
                  userId: userId
                }
              }).then(function() {
                job.stop()
              })

  					} else {
              console.log(userId + ' is going to get some points because they are logged on and watching tweak stream ' + currentKiwiPoints)

              db.kiwi.update({
                points: currentKiwiPoints
              }, {
                where: {
                  userId: userId
                }
              }).then(function(kiwi) {
                 
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