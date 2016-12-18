$(function() {
   console.log('timer running')

  var months = {
    Jan: 01,
    Feb: 02,
    Mar: 03,
    Apr: 04,
    May: 05,
    Jun: 06,
    Jul: 07,
    Aug: 08,
    Sep: 09,
    Oct: 10,
    Nov: 11,
    Dec: 12
  };

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var giveawayIdInts = [];

  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    giveawayIdInts.push(int);
  });

  var contestStartTime;

  giveawayIdInts.forEach(function(val) {

    var time = $('h4[giveawayId="' + val + '"]').text(),
        timeSplit = time.split(' '),
        year = timeSplit[3],
        month = timeSplit[1],
        day = timeSplit[2],
        hourMinSec = timeSplit[4],
        convertedMonth = months[month],
        giveawayStartTime = year + '-' + convertedMonth + '-' + day + 'T' + hourMinSec + 'Z';
    console.log(giveawayStartTime);
    var currentTime = moment().format();
    console.log(currentTime + ' currenttime')

    var thing = moment(giveawayStartTime).format();
    console.log(thing + ' start');
        var endTime = moment(giveawayStartTime).add(5, 'minutes').format();
    console.log(endTime + ' endtime')
      
  });

});