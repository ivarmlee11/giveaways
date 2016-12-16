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

  giveawayIdInts.forEach(function(val) {
    var time = $('h4[giveawayId=' + val ']').val();
    console.log(time)
  });


});