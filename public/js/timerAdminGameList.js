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
    console.log(time.format())
    console.log()
    contestStartTime = moment.utc(time).format();
    console.log(contestStartTime + " contest start time")
    var localTime = moment();
    console.log(localTime + " local time moment()")
    // var realTime = moment.utc(localTime).format()
  });

});