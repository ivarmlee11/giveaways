$(function() {
  console.log()

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var giveawayIdInts = [];
  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    console.log(int)
    giveawayIdInts.push(int);
  });
  console.log(giveawayIdInts);
});