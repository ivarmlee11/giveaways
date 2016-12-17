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

  giveawayIdInts.forEach(function(val) {
    var time = $('h4[giveawayId="' + val + '"]').text();
    contestStartTime = moment(time).local();
    console.log(contestStartTime)
    console.log(moment.local())

  });

});