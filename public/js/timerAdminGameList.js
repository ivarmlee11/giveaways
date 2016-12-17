$(function() {

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var giveawayIdInts = [];

  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    giveawayIdInts.push(int);
  });

  var contestStartTime;

  console.log('timer running')

  console.log(giveawayIds)

  giveawayIdInts.forEach(function(val) {
    var time = $('h4[giveawayId="' + val + '"]').text();
    var timeSplit = time.split(' ');
    console.log(timeSplit)
    contestStartTime = moment.utc(time).format();
    console.log(contestStartTime + " contest start time")
  });

});