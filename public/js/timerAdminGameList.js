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


  console.log(giveawayIds)

  giveawayIdInts.forEach(function(val) {
    var time = $('h4[giveawayId="' + val + '"]').text(),
        timeSplit = time.split(' '),
        year = timeSplit[3],
        month = timeSplit[1],
        day = timeSplit[2],
        hourMinSec = timeSplit[4],
        convertedMonth = month,
        isoDateString = year + '-' + convertedMonth + '-' + day + 'T' + hourMinSec;

    console.log(isoDateString);
  });

});