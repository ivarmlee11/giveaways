$(function() {

  function getPlayerEntries(){
    var giveawayIds = $('.numberOfPlayer').map( function() {
        return $(this).attr('giveawayId');
    }).get();
    console.log(giveawayIds);
  };

  getPlayerEntries();

});