$(function() {
  console.log()

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId').parseInt();
  }).get();

  console.log(giveawayIds);
});