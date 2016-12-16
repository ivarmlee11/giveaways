$(function() {
  console.log()

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var giveawayIdInts = [];
  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    giveawayIdInts.push(int);
  });
  console.log(giveawayIdInts);
  giveawayIdInts.forEach(function(val) {
    var time = $('h4[giveawayId="' + val + '"]').text().split(' ');
    console.log(time[4]) 
  });


});