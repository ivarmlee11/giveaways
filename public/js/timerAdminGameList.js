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
    console.log(time + ' time')
    console.log(val + ' val')
    contestStartTime = moment.utc(time).format();
    console.log(contestStartTime);

    var localTime = moment();
    var realTime = moment.utc(localTime).format()
    console.log(realTime);
  });

});